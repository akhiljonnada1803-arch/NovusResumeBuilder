import * as zlib from "zlib";
import JSZip from "jszip";
import mammoth from "mammoth";
import { extractText } from "unpdf";

export interface ExtractedDocumentContent {
  rawText: string;
  lines: string[];
  base64Data?: string;
  metadata: {
    format: "pdf" | "docx" | "txt" | "unknown";
    fileName: string;
    characterCount: number;
    lineCount: number;
    extractionMethod: string;
  };
}

/**
 * Robust, deterministic document text extractor for PDF, DOCX, and Plain Text files.
 */
export async function extractTextFromBuffer(
  buffer: Buffer | ArrayBuffer,
  fileName: string
): Promise<string> {
  const result = await extractDocumentWithMetadata(buffer, fileName);
  return result.rawText;
}

/**
 * Extracts document text along with line mapping, base64 data, and diagnostic metadata.
 */
export async function extractDocumentWithMetadata(
  buffer: Buffer | ArrayBuffer,
  fileName: string
): Promise<ExtractedDocumentContent> {
  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const ext = fileName.toLowerCase().split(".").pop() || "";
  const base64Data = nodeBuffer.toString("base64");

  // 1. Plain Text / Markdown / RTF / JSON
  if (ext === "txt" || ext === "md" || ext === "json" || ext === "rtf") {
    let raw = nodeBuffer.toString("utf-8");
    if (ext === "rtf") {
      raw = raw.replace(/\\par[d]?/g, "\n").replace(/\\[a-zA-Z0-9_-]+/g, "").replace(/[{}]/g, "");
    }
    const cleaned = cleanText(raw);
    const lines = splitIntoCleanLines(cleaned);
    return {
      rawText: cleaned,
      lines,
      base64Data,
      metadata: {
        format: "txt",
        fileName,
        characterCount: cleaned.length,
        lineCount: lines.length,
        extractionMethod: "utf8_direct_reader",
      },
    };
  }

  // 2. Microsoft Word (DOCX / DOC)
  if (ext === "docx" || ext === "doc") {
    try {
      const mammothResult = await mammoth.extractRawText({ buffer: nodeBuffer });
      if (mammothResult && mammothResult.value && mammothResult.value.trim().length > 20) {
        const cleaned = cleanText(mammothResult.value);
        const lines = splitIntoCleanLines(cleaned);
        return {
          rawText: cleaned,
          lines,
          base64Data,
          metadata: {
            format: "docx",
            fileName,
            characterCount: cleaned.length,
            lineCount: lines.length,
            extractionMethod: "mammoth_docx_reader",
          },
        };
      }
    } catch (docxErr) {
      console.warn("Mammoth extraction notice, falling back to JSZip XML parser:", docxErr);
    }

    try {
      const zip = await JSZip.loadAsync(nodeBuffer);
      const docXml = await zip.file("word/document.xml")?.async("string");
      if (docXml) {
        const xmlWithLinebreaks = docXml.replace(/<\/w:p>/g, "\n").replace(/<w:tab\/>/g, " ");
        const matches = xmlWithLinebreaks.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>|\n/g);
        if (matches) {
          const docxText = matches
            .map((m) => (m === "\n" ? "\n" : m.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, "")))
            .join("");
          const cleaned = cleanText(docxText);
          const lines = splitIntoCleanLines(cleaned);
          if (cleaned.length > 20) {
            return {
              rawText: cleaned,
              lines,
              base64Data,
              metadata: {
                format: "docx",
                fileName,
                characterCount: cleaned.length,
                lineCount: lines.length,
                extractionMethod: "jszip_xml_parser",
              },
            };
          }
        }
      }
    } catch (zipErr) {
      console.warn("JSZip DOCX parser notice:", zipErr);
    }
  }

  // 3. Adobe PDF Extractor (High-Precision PDF.js / unpdf Engine with CMap and ToUnicode support)
  if (ext === "pdf") {
    try {
      const uint8 = new Uint8Array(nodeBuffer);
      const pdfResult = await extractText(uint8, { mergePages: true });
      const rawPdfText = Array.isArray(pdfResult.text) ? pdfResult.text.join("\n\n") : (pdfResult.text || "");

      if (rawPdfText && rawPdfText.trim().length > 20) {
        const cleaned = cleanText(rawPdfText);
        const lines = splitIntoCleanLines(cleaned);
        return {
          rawText: cleaned,
          lines,
          base64Data,
          metadata: {
            format: "pdf",
            fileName,
            characterCount: cleaned.length,
            lineCount: lines.length,
            extractionMethod: "unpdf_unicode_extractor",
          },
        };
      }
    } catch (unpdfErr) {
      console.warn("unpdf extraction notice, attempting fallback stream decompressor:", unpdfErr);
    }

    try {
      const pdfText = extractPdfTextFromBinary(nodeBuffer);
      if (pdfText && pdfText.trim().length > 30) {
        const cleaned = cleanText(pdfText);
        const lines = splitIntoCleanLines(cleaned);
        return {
          rawText: cleaned,
          lines,
          base64Data,
          metadata: {
            format: "pdf",
            fileName,
            characterCount: cleaned.length,
            lineCount: lines.length,
            extractionMethod: "pdf_stream_decompressor",
          },
        };
      }
    } catch (pdfErr) {
      console.warn("PDF stream decompressor notice:", pdfErr);
    }
  }

  // 4. Universal Printable Text Recovery
  const raw = nodeBuffer.toString("latin1");
  const printable = raw
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s{3,}/g, "\n\n")
    .trim();
  const lines = splitIntoCleanLines(printable);

  return {
    rawText: printable,
    lines,
    base64Data,
    metadata: {
      format: "unknown",
      fileName,
      characterCount: printable.length,
      lineCount: lines.length,
      extractionMethod: "printable_sweep_fallback",
    },
  };
}

/**
 * Decompresses and extracts readable text from PDF binary streams.
 * Handles /FlateDecode zlib decompression, hex encoded strings, and text positioning operators.
 */
function extractPdfTextFromBinary(buffer: Buffer): string {
  const extractedChunks: string[] = [];
  const latinContent = buffer.toString("latin1");

  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(latinContent)) !== null) {
    const rawStreamString = match[1];
    const streamBuffer = Buffer.from(rawStreamString, "latin1");

    let streamData: string = "";

    try {
      const decompressed = zlib.inflateSync(streamBuffer);
      streamData = decompressed.toString("latin1");
    } catch {
      try {
        const decompressed = zlib.inflateRawSync(streamBuffer);
        streamData = decompressed.toString("latin1");
      } catch {
        streamData = rawStreamString;
      }
    }

    const textFromStream = parsePdfStreamText(streamData);
    if (textFromStream.trim().length > 0) {
      extractedChunks.push(textFromStream);
    }
  }

  if (extractedChunks.join(" ").trim().length < 50) {
    const globalText = parsePdfStreamText(latinContent);
    if (globalText.trim().length > 50) {
      extractedChunks.push(globalText);
    }
  }

  return extractedChunks.join("\n\n");
}

/**
 * Parses PDF operators such as Tj, TJ, hex strings <...>, ' and " inside decompressed stream data
 */
function parsePdfStreamText(streamText: string): string {
  const lines: string[] = [];
  const btRegex = /BT[\s\S]*?ET/g;
  const btBlocks = streamText.match(btRegex) || [streamText];

  for (const block of btBlocks) {
    let blockText = "";

    // 1. Array strings with TJ operator: [(Text) 20 (More)] TJ or [<0048> 10 <0065>] TJ
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
    let tjArrayMatch: RegExpExecArray | null;
    while ((tjArrayMatch = tjArrayRegex.exec(block)) !== null) {
      const arrayContent = tjArrayMatch[1];
      const stringParts = arrayContent.match(/\((?:[^()\\]|\\.)*\)|<[0-9a-fA-F\s]+>/g);
      if (stringParts) {
        const phrase = stringParts
          .map((s) => {
            if (s.startsWith("<") && s.endsWith(">")) {
              return decodePdfHexString(s.slice(1, -1));
            }
            return decodePdfString(s.slice(1, -1));
          })
          .join("");
        blockText += phrase + " ";
      }
    }

    // 2. Simple strings: (Text) Tj or <Hex> Tj
    const tjSimpleRegex = /(?:\((?:[^()\\]|\\.)*\)|<[0-9a-fA-F\s]+>)\s*(?:Tj|'|")/g;
    let tjSimpleMatch: RegExpExecArray | null;
    while ((tjSimpleMatch = tjSimpleRegex.exec(block)) !== null) {
      const s = tjSimpleMatch[0].replace(/\s*(?:Tj|'|")$/, "").trim();
      let phrase = "";
      if (s.startsWith("<") && s.endsWith(">")) {
        phrase = decodePdfHexString(s.slice(1, -1));
      } else if (s.startsWith("(") && s.endsWith(")")) {
        phrase = decodePdfString(s.slice(1, -1));
      }
      if (phrase) {
        blockText += phrase + "\n";
      }
    }

    if (blockText.trim().length > 0) {
      lines.push(blockText.trim());
    }
  }

  return lines.join("\n");
}

function decodePdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

function decodePdfHexString(hex: string): string {
  const cleanHex = hex.replace(/\s+/g, "");
  let str = "";
  for (let i = 0; i < cleanHex.length; i += 2) {
    const code = parseInt(cleanHex.substring(i, i + 2), 16);
    if (!isNaN(code) && code > 0) {
      str += String.fromCharCode(code);
    }
  }
  return str;
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    // Normalize missing space after colon when followed by letters (e.g. "Scoring:Formulated" -> "Scoring: Formulated", but preserve "http://")
    .replace(/([a-zA-Z0-9]):(?!\/\/)([a-zA-Z])/g, "$1: $2")
    // Normalize missing space after comma
    .replace(/([a-zA-Z0-9]),([a-zA-Z])/g, "$1, $2")
    // Normalize missing space after period when followed by capital letter in sentence context
    .replace(/([a-z])\.([A-Z])/g, "$1. $2")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+\n/g, "\n\n")
    .trim();
}

function splitIntoCleanLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

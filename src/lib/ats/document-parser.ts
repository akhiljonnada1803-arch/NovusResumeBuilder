import mammoth from "mammoth";

/**
 * Extracts plain text from an uploaded buffer (PDF, DOCX, or TXT).
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt"
): Promise<string> {
  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return cleanExtractedText(result.value);
  }

  if (fileType === "txt") {
    return cleanExtractedText(buffer.toString("utf-8"));
  }

  if (fileType === "pdf") {
    // Basic text stream extractor from PDF buffer
    const rawString = buffer.toString("binary");
    const textMatches: string[] = [];

    // Extract printable ASCII/Unicode chunks from PDF stream
    const textBlocks = rawString.match(/\(([^\(\)\\]|\\.)*\)\s*Tj/g) || [];
    if (textBlocks.length > 0) {
      textBlocks.forEach((block) => {
        const text = block.replace(/^[\s\(]+/, "").replace(/[\s\)]+Tj$/, "").replace(/\\/g, "");
        if (text) textMatches.push(text);
      });
      return cleanExtractedText(textMatches.join(" "));
    }

    // Fallback printable character sweep
    const printable = rawString
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return cleanExtractedText(printable.slice(0, 8000));
  }

  return cleanExtractedText(buffer.toString("utf-8"));
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

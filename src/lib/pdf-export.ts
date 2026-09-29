import jsPDF from "jspdf";
import { saveFileWithNativeFallback } from "@/lib/desktop/tauri-bridge";

export interface PDFExportOptions {
  filename?: string;
  onProgress?: (status: string) => void;
}

/**
 * Renders an HTML element directly to a high-resolution Canvas using native browser SVG foreignObject.
 * This completely avoids html2canvas CSS parsing bugs (like unsupported 'lab', 'oklch' color functions).
 */
async function renderElementToCanvas(
  element: HTMLElement,
  scale: number = 2.5
): Promise<HTMLCanvasElement> {
  // Use exact bounding dimensions of the A4 resume (794px x 1123px standard for A4 at 96 DPI)
  const rect = element.getBoundingClientRect();
  const width = Math.round(rect.width) || 794;
  const height = Math.round(rect.height) || 1123;

  // Clone element to prevent mutations on active UI
  const cloned = element.cloneNode(true) as HTMLElement;
  cloned.style.transform = "none";
  cloned.style.boxShadow = "none";
  cloned.style.margin = "0";
  cloned.style.position = "static";
  cloned.style.left = "auto";
  cloned.style.top = "auto";
  cloned.style.width = `${width}px`;
  cloned.style.minHeight = `${height}px`;

  // Aggregate all page stylesheets
  let combinedCss = "";
  try {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          Array.from(rules).forEach((rule) => {
            combinedCss += rule.cssText + "\n";
          });
        }
      } catch {
        // Cross-origin sheets might throw; safe to continue
      }
    });
  } catch {
    // Ignore stylesheet read errors
  }

  // Ensure background is solid white for A4 paper
  combinedCss += `
    #resume-preview-document {
      background-color: #ffffff !important;
      color: #0F172A !important;
      width: 100% !important;
      box-shadow: none !important;
      transform: none !important;
    }
  `;

  const serializedHtml = new XMLSerializer().serializeToString(cloned);

  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; width:100%; height:100%; margin:0; padding:0;">
          <style>${combinedCss}</style>
          ${serializedHtml}
        </div>
      </foreignObject>
    </svg>
  `;

  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to initialize canvas 2D rendering context.");
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(blobUrl);
        resolve(canvas);
      } catch (err) {
        URL.revokeObjectURL(blobUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("SVG foreignObject rendering failed. Falling back to native print."));
    };

    img.src = blobUrl;
  });
}

/**
 * High-quality multi-page PDF generation utility using native browser vector rendering & jsPDF.
 * Preserves styling, typography, colors, and prevents content distortion across pages.
 */
export async function exportResumeToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const { filename = "Resume_NovusAI.pdf", onProgress } = options;

  onProgress?.("Preparing high-res document...");

  // Temporarily reset transform/zoom if parent has scale transforms
  const originalTransform = element.style.transform;
  const originalBoxShadow = element.style.boxShadow;
  element.style.boxShadow = "none";

  try {
    onProgress?.("Rendering canvas...");

    let canvas: HTMLCanvasElement;
    try {
      canvas = await renderElementToCanvas(element, 2.5);
    } catch (renderError) {
      console.warn("ForeignObject rendering encountered issue, falling back to window.print():", renderError);
      window.print();
      return;
    }

    onProgress?.("Generating A4 PDF pages...");

    // Standard A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;

    // Calculate dimensions in mm corresponding to canvas aspect ratio
    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    // Multi-page slicing calculation
    let heightLeftMm = imgHeightMm;

    // First page
    const pageCanvas = document.createElement("canvas");
    const ctx = pageCanvas.getContext("2d");

    const pxPageHeight = (canvas.width * pageHeightMm) / pageWidthMm;

    // If single page or fits within A4 page height
    if (imgHeightMm <= pageHeightMm + 2) {
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, imgHeightMm, undefined, "FAST");
    } else {
      // Multi-page rendering: slice canvas per A4 height to prevent clipping
      let pageIndex = 0;
      let sourceY = 0;

      while (heightLeftMm > 0) {
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pxPageHeight, canvas.height - sourceY);

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            canvas.width,
            pageCanvas.height
          );
        }

        const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.98);
        const sliceHeightMm = (pageCanvas.height * imgWidthMm) / canvas.width;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(pageImgData, "JPEG", 0, 0, imgWidthMm, sliceHeightMm, undefined, "FAST");

        sourceY += pxPageHeight;
        heightLeftMm -= pageHeightMm;
        pageIndex++;
      }
    }

    onProgress?.("Saving PDF file...");
    const pdfDataUri = pdf.output("datauristring");
    await saveFileWithNativeFallback(filename, pdfDataUri, "application/pdf");
  } catch (error) {
    console.error("PDF export failed:", error);
    // Graceful fallback to browser native vector print dialog
    if (typeof window !== "undefined") {
      window.print();
    }
  } finally {
    element.style.transform = originalTransform;
    element.style.boxShadow = originalBoxShadow;
  }
}

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveFileWithNativeFallback } from "@/lib/desktop/tauri-bridge";

export interface PDFExportOptions {
  filename?: string;
  onProgress?: (status: string) => void;
}

/**
 * Prints the resume via an isolated, hidden iframe.
 * This guarantees 100% clean A4 vector rendering, eliminates layout transform clipping,
 * avoids browser popup blockers, and ensures all Tailwind/Google fonts apply cleanly.
 */
export function printResumeViaIframe(element: HTMLElement): void {
  if (typeof window === "undefined") return;

  // Clean up any previously created print iframe
  const existingFrame = document.getElementById("novus-print-iframe");
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = "novus-print-iframe";
  iframe.setAttribute(
    "style",
    "position:fixed; top:0; left:0; width:0; height:0; border:0; visibility:hidden; z-index:-9999;"
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect all stylesheet links and style tags from current document
  let stylesHtml = "";
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    stylesHtml += node.outerHTML + "\n";
  });

  const printOverrides = `
    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #0F172A !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        width: 210mm !important;
      }
      #resume-preview-document {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 auto !important;
        padding: 20mm !important;
        background: #ffffff !important;
        color: #0F172A !important;
        box-shadow: none !important;
        border: none !important;
        transform: none !important;
        border-radius: 0 !important;
      }
      /* Prevent awkward page break cuts inside sections */
      .resume-section-item,
      .resume-section-header,
      .resume-experience-item,
      .resume-education-item,
      .resume-project-item {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    </style>
  `;

  // Get the resume container HTML
  const resumeHtml = element.outerHTML;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Resume – Novus AI</title>
        ${stylesHtml}
        ${printOverrides}
      </head>
      <body>
        ${resumeHtml}
      </body>
    </html>
  `);
  doc.close();

  const executePrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn("Iframe print encountered an issue, falling back to window.print():", err);
      window.print();
    } finally {
      // Clean up iframe after user completes print dialog
      setTimeout(() => {
        iframe.remove();
      }, 1500);
    }
  };

  // Wait briefly for iframe DOM and styles to parse
  setTimeout(executePrint, 300);
}

/**
 * High-quality multi-page PDF export utility using html2canvas + jsPDF.
 */
export async function exportResumeToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const { filename = "Resume_NovusAI.pdf", onProgress } = options;

  onProgress?.("Preparing document...");

  // Temporarily neutralize parent zoom/scale transform so canvas captures at true 100% resolution
  const parentEl = element.parentElement as HTMLElement | null;
  const parentOriginalTransform = parentEl?.style.transform ?? "";
  const parentOriginalOrigin = parentEl?.style.transformOrigin ?? "";
  if (parentEl) {
    parentEl.style.transform = "none";
    parentEl.style.transformOrigin = "unset";
  }

  const originalBoxShadow = element.style.boxShadow;
  const originalBorderRadius = element.style.borderRadius;
  element.style.boxShadow = "none";
  element.style.borderRadius = "0";

  try {
    onProgress?.("Rendering high-res canvas...");

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: element.offsetWidth || element.scrollWidth,
      height: element.offsetHeight || element.scrollHeight,
      windowWidth: element.offsetWidth || 794,
      windowHeight: element.offsetHeight || 1123,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById("resume-preview-document");
        if (clonedEl) {
          clonedEl.style.boxShadow = "none";
          clonedEl.style.border = "none";
          clonedEl.style.transform = "none";
          clonedEl.style.margin = "0";
        }
      },
    });

    onProgress?.("Generating A4 PDF pages...");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;

    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    if (imgHeightMm <= pageHeightMm + 2) {
      // Single page document
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, imgHeightMm, undefined, "FAST");
    } else {
      // Multi-page document slicing
      const pxPerMm = canvas.width / pageWidthMm;
      const pxPageHeight = Math.round(pageHeightMm * pxPerMm);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      let sourceY = 0;
      let pageIndex = 0;

      while (sourceY < canvas.height) {
        const sliceHeight = Math.min(pxPageHeight, canvas.height - sourceY);
        pageCanvas.height = sliceHeight;
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, sliceHeight);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );
        }

        const sliceHeightMm = (sliceHeight * pageWidthMm) / canvas.width;
        if (pageIndex > 0) {
          pdf.addPage();
        }
        pdf.addImage(
          pageCanvas.toDataURL("image/jpeg", 0.98),
          "JPEG",
          0,
          0,
          imgWidthMm,
          sliceHeightMm,
          undefined,
          "FAST"
        );

        sourceY += pxPageHeight;
        pageIndex++;
      }
    }

    onProgress?.("Saving PDF...");
    const pdfDataUri = pdf.output("datauristring");
    await saveFileWithNativeFallback(filename, pdfDataUri, "application/pdf");
  } catch (error) {
    console.error("PDF export failed:", error);
    // Fallback to iframe vector print
    printResumeViaIframe(element);
  } finally {
    element.style.boxShadow = originalBoxShadow;
    element.style.borderRadius = originalBorderRadius;
    if (parentEl) {
      parentEl.style.transform = parentOriginalTransform;
      parentEl.style.transformOrigin = parentOriginalOrigin;
    }
  }
}

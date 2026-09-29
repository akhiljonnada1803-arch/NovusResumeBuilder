import jsPDF from "jspdf";
import { CoverLetter } from "@/types/cover-letter";

/**
 * Generates an executive letterhead PDF for a cover letter.
 */
export async function exportCoverLetterPDF(coverLetter: CoverLetter): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54; // 0.75 in
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // 1. Executive Header / Sender Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(coverLetter.senderName || "Candidate Name", margin, y);
  y += 16;

  if (coverLetter.senderTitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(coverLetter.senderTitle, margin, y);
    y += 14;
  }

  // Contact line
  const contactParts = [
    coverLetter.senderEmail,
    coverLetter.senderPhone,
    coverLetter.senderLocation,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(contactParts.join("  •  "), margin, y);
    y += 16;
  }

  // Divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  // 2. Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(coverLetter.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), margin, y);
  y += 20;

  // 3. Recipient Block
  if (coverLetter.recipientName || coverLetter.recipientCompany) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    if (coverLetter.recipientName) {
      doc.text(coverLetter.recipientName, margin, y);
      y += 13;
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    if (coverLetter.recipientTitle) {
      doc.text(coverLetter.recipientTitle, margin, y);
      y += 13;
    }
    if (coverLetter.recipientCompany) {
      doc.text(coverLetter.recipientCompany, margin, y);
      y += 13;
    }
    if (coverLetter.recipientLocation) {
      doc.text(coverLetter.recipientLocation, margin, y);
      y += 13;
    }
    y += 12;
  }

  // 4. Letter Body Paragraphs
  const paragraphs = coverLetter.content.split("\n\n").filter(Boolean);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // slate-800

  paragraphs.forEach((p) => {
    // Split into wrapped lines
    const lines = doc.splitTextToSize(p.trim(), contentWidth);
    doc.text(lines, margin, y, { lineHeightFactor: 1.4 });
    y += lines.length * 15 + 10;
  });

  // Save / Trigger Download
  const filename = `${coverLetter.senderName.replace(/\s+/g, "_")}_Cover_Letter_${(coverLetter.companyName || "Company").replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}

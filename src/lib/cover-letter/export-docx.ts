import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { CoverLetter } from "@/types/cover-letter";

/**
 * Generates and triggers browser download of a formatted Microsoft Word (.docx) cover letter.
 */
export async function exportCoverLetterDOCX(coverLetter: CoverLetter): Promise<void> {
  const paragraphs: Paragraph[] = [];

  // 1. Sender Header
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: coverLetter.senderName || "Candidate Name",
          bold: true,
          size: 32, // 16pt
          color: "0F172A",
          font: "Calibri",
        }),
      ],
    })
  );

  if (coverLetter.senderTitle) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: coverLetter.senderTitle,
            size: 22, // 11pt
            color: "475569",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  // Contact line
  const contactParts = [
    coverLetter.senderEmail,
    coverLetter.senderPhone,
    coverLetter.senderLocation,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        border: {
          bottom: {
            color: "E2E8F0",
            space: 6,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: contactParts.join("   •   "),
            size: 20, // 10pt
            color: "64748B",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  // 2. Date
  paragraphs.push(
    new Paragraph({
      spacing: { before: 120, after: 180 },
      children: [
        new TextRun({
          text: coverLetter.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          size: 22,
          color: "334155",
          font: "Calibri",
        }),
      ],
    })
  );

  // 3. Recipient Block
  if (coverLetter.recipientName || coverLetter.recipientCompany) {
    if (coverLetter.recipientName) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: coverLetter.recipientName,
              bold: true,
              size: 22,
              color: "0F172A",
              font: "Calibri",
            }),
          ],
        })
      );
    }
    if (coverLetter.recipientTitle) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: coverLetter.recipientTitle,
              size: 22,
              color: "475569",
              font: "Calibri",
            }),
          ],
        })
      );
    }
    if (coverLetter.recipientCompany) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: coverLetter.recipientCompany,
              size: 22,
              color: "475569",
              font: "Calibri",
            }),
          ],
        })
      );
    }
    if (coverLetter.recipientLocation) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: coverLetter.recipientLocation,
              size: 22,
              color: "64748B",
              font: "Calibri",
            }),
          ],
        })
      );
    }
  }

  // 4. Letter Content Body Paragraphs
  const contentParagraphs = coverLetter.content.split("\n\n").filter(Boolean);

  contentParagraphs.forEach((pText) => {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 180, line: 276 }, // 1.15 line spacing
        children: [
          new TextRun({
            text: pText.trim(),
            size: 22, // 11pt
            color: "1E293B",
            font: "Calibri",
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080, // 0.75 in
              right: 1080,
              bottom: 1080,
              left: 1080,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  // Generate buffer and trigger browser download
  const blob = await Packer.toBlob(doc);
  const filename = `${coverLetter.senderName.replace(/\s+/g, "_")}_Cover_Letter_${(coverLetter.companyName || "Company").replace(/\s+/g, "_")}.docx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

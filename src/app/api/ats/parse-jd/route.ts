import { NextRequest, NextResponse } from "next/server";
import { parseDocumentBuffer } from "@/lib/ats/document-parser";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = file.name.toLowerCase();

      let fileType: "pdf" | "docx" | "txt" = "txt";
      if (fileName.endsWith(".pdf")) fileType = "pdf";
      else if (fileName.endsWith(".docx")) fileType = "docx";

      const extractedText = await parseDocumentBuffer(buffer, fileType);

      if (!extractedText || extractedText.length < 20) {
        return NextResponse.json(
          { error: "Could not extract sufficient text from the uploaded document." },
          { status: 422 }
        );
      }

      return NextResponse.json({ text: extractedText, fileName: file.name });
    }

    // Direct JSON payload
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Job description text must be at least 10 characters." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: any) {
    console.error("Parse JD API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse job description." },
      { status: 500 }
    );
  }
}

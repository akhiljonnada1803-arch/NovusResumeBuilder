import { NextRequest, NextResponse } from "next/server";
import { parseRawResumeText } from "@/lib/import/resume-parser";
import { extractDocumentWithMetadata } from "@/lib/import/document-reader";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 30 extraction requests per minute per IP
    const { isRateLimited, resetTime } = await checkRateLimit(req, {
      name: "anonymous",
      maxRequests: 30,
      windowSeconds: 60,
    });

    if (isRateLimited) {
      return NextResponse.json(
        { error: `Too many import requests. Please wait ${resetTime}s before trying again.` },
        { status: 429 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let rawText = "";
    let fileName = "Uploaded_Resume.pdf";
    let fileType = "application/pdf";
    let base64Data: string | undefined = undefined;

    let userApiKey = req.headers.get("x-gemini-api-key") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const formKey = formData.get("apiKey") as string | null;
      if (formKey) userApiKey = formKey;

      if (file) {
        fileName = file.name;
        fileType =
          file.type ||
          (fileName.endsWith(".docx")
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/pdf");
        const arrayBuffer = await file.arrayBuffer();
        const docResult = await extractDocumentWithMetadata(arrayBuffer, file.name);
        rawText = docResult.rawText;
        base64Data = docResult.base64Data;
      }
    } else {
      const body = await req.json();
      rawText = body.text || "";
      fileName = body.fileName || "Uploaded_Resume.txt";
      fileType = body.fileType || "text/plain";
      base64Data = body.base64Data;
      if (body.apiKey) userApiKey = body.apiKey;
    }

    // If both rawText and base64Data are empty, return error
    if ((!rawText || rawText.trim().length === 0) && !base64Data) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract readable text from the uploaded document. Please check the file format or copy and paste the resume text directly.",
        },
        { status: 422 }
      );
    }

    const extraction = await parseRawResumeText(rawText, fileName, fileType, base64Data, userApiKey);

    return NextResponse.json({
      success: true,
      extraction,
      message: "Resume extracted with 100% source traceability.",
    });
  } catch (error: any) {
    console.error("Resume Import route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while parsing the resume document.",
      },
      { status: 500 }
    );
  }
}

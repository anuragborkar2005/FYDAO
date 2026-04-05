import { uploadJsonToPinataAction } from "@/app/actions/pinata"
import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getIpfsUrl } from "@/utils/ipfs"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { proofCid, context } = await request.json()

    if (!proofCid) {
      return NextResponse.json(
        { error: "proofCid is required" },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const fileUrl = getIpfsUrl(proofCid)
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error(
        `Failed to fetch file from IPFS: ${fileResponse.statusText}`
      )
    }

    const contentType =
      fileResponse.headers.get("content-type") || "application/octet-stream"
    const arrayBuffer = await fileResponse.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")

    // Use v1 instead of v1beta to ensure model availability
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
      Analyze the attached document/image for a crowdfunding campaign verification.
      ${context ? `Context about this request: "${context}"` : ""}
      Determine if the proof appears legitimate and consistent with a request for funding.

      Return your analysis strictly in JSON format with the following structure:
      {
        "verdict": "positive" | "negative" | "neutral",
        "confidence": number (0-100),
        "summary": "A brief summary of your finding",
        "details": "More detailed explanation of the analysis"
      }
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: contentType,
        },
      },
    ])

    const responseText = result.response.text()
    // Extract JSON if model wraps it in markdown blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const aiResult = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : JSON.parse(responseText)

    const reportCid = await uploadJsonToPinataAction({
      ...aiResult,
      analyzedAt: new Date().toISOString(),
      proofCid,
    })

    return NextResponse.json({
      success: true,
      aiResult: {
        ...aiResult,
        reportCid: reportCid.cid,
      },
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("AI Analysis Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

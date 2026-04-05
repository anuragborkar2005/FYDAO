import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Milestone from "@/models/milestone"

export async function POST(request: NextRequest) {
  try {
    const { campaignAddress, proofCid, amount, proposalId, aiResult } =
      await request.json()

    if (!campaignAddress || !proofCid || !amount || !proposalId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const count = await Milestone.countDocuments({
      campaignAddress: campaignAddress.toLowerCase(),
    })
    const milestoneId = count

    const milestone = await Milestone.create({
      campaignAddress: campaignAddress.toLowerCase(),
      milestoneId,
      proofCid,
      amount,
      status: "voting",
      proposalId,
      aiAnalysis: aiResult
        ? {
            reportCid: aiResult.reportCid,
            verdict: aiResult.verdict,
            confidence: aiResult.confidence,
            details: aiResult.summary || aiResult.details,
          }
        : undefined,
    })

    return NextResponse.json({
      success: true,
      milestone,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

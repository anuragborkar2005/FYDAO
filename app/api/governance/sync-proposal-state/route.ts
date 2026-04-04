import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Proposal from "@/models/proposal"
import Campaign from "@/models/campaign"

export async function POST(request: NextRequest) {
  try {
    const { proposalId, status, txHash, campaignAddress } = await request.json()

    if (!proposalId || !status) {
      return NextResponse.json(
        { error: "Missing proposalId or status" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const updatedProposal = await Proposal.findOneAndUpdate(
      { proposalId: proposalId.toString() },
      {
        $set: {
          status: status,
          lastTxHash: txHash,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    )

    if (status === "executed" && updatedProposal.isCampaignApproval) {
      const targetAddress = campaignAddress || updatedProposal.campaignAddress

      if (targetAddress) {
        await Campaign.findOneAndUpdate(
          { onChainAddress: targetAddress.toLowerCase() },
          {
            $set: {
              status: "live",
              isLive: true,
              approvedAt: new Date(),
            },
          }
        )
      }
    }

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
    })
  } catch (error: any) {
    console.error("State Sync Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

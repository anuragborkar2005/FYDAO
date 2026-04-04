import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Proposal from "@/models/proposal"
import Campaign from "@/models/campaign"
import Milestone from "@/models/milestone"

export async function POST(request: NextRequest) {
  try {
    const { proposalId, txHash } = await request.json()

    if (!proposalId) {
      return NextResponse.json({ error: "Missing proposalId" }, { status: 400 })
    }

    await connectToDatabase()

    const proposal = await Proposal.findOneAndUpdate(
      { proposalId: proposalId.toString() },
      {
        $set: {
          status: "executed",
          executedTxHash: txHash,
          executedAt: new Date(),
        },
      },
      { new: true }
    )

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    if (proposal.isCampaignApproval && proposal.campaignAddress) {
      await Campaign.findOneAndUpdate(
        { onChainAddress: proposal.campaignAddress.toLowerCase() },
        {
          $set: {
            status: "live",
            isLive: true,
            approvedAt: new Date(),
          },
        }
      )
    }

    if (proposal.isMilestoneRelease && proposal.campaignAddress) {
      await Milestone.findOneAndUpdate(
        {
          campaignAddress: proposal.campaignAddress.toLowerCase(),
          proposalId: proposalId.toString(),
        },
        {
          $set: {
            status: "released",
            releasedAt: new Date(),
          },
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "System state synchronized after execution",
    })
  } catch (error: any) {
    console.error("Execution Sync Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

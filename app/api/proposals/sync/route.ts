import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Proposal from "@/models/proposal"
import Campaign from "@/models/campaign"

export async function POST(request: NextRequest) {
  try {
    const {
      proposalId,
      campaignAddress,
      proposer,
      description,
      transactionHash,
    } = await request.json()

    if (!proposalId || !campaignAddress) {
      return NextResponse.json(
        { error: "Missing required proposal or campaign data" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const proposal = await Proposal.findOneAndUpdate(
      { proposalId: proposalId.toString() },
      {
        proposalId: proposalId.toString(),
        description: description || "",
        proposer: proposer?.toLowerCase(),
        campaignAddress: campaignAddress.toLowerCase(),
        status: "pending",
        isCampaignApproval: true,
        transactionHash: transactionHash,
        createdAt: new Date(),
        votesFor: 0,
        votesAgainst: 0,
      },
      { upsert: true, new: true }
    )

    await Campaign.findOneAndUpdate(
      { onChainAddress: campaignAddress.toLowerCase() },
      {
        status: "pending_approval",
        approvalProposalId: proposalId.toString(),
      }
    )

    console.log(
      `✅ Sync successful: Proposal ${proposalId} for Campaign ${campaignAddress}`
    )

    return NextResponse.json({
      success: true,
      data: proposal,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Proposal manual sync error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

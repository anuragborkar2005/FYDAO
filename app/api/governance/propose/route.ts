import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Proposal from "@/models/proposal"
import Campaign from "@/models/campaign"
import Milestone from "@/models/milestone"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      proposalId,
      description,
      targets,
      values,
      calldatas,
      proposer,
      isCampaignApproval = false,
      campaignAddress,
      milestoneId,
    } = body

    if (!proposalId || !description || !targets || !proposer) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: proposalId, description, targets, proposer",
        },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const newProposal = await Proposal.create({
      proposalId: proposalId.toString(),
      description,
      targets: targets.map((t: string) => t.toLowerCase()),
      values: values || [0],
      calldatas,
      proposer: proposer.toLowerCase(),
      isCampaignApproval,
      campaignAddress: campaignAddress ? campaignAddress.toLowerCase() : null,
      milestoneId: milestoneId || null,
      status: "pending",
      votesFor: 0,
      votesAgainst: 0,
      createdAt: new Date(),
    })

    if (isCampaignApproval && campaignAddress) {
      await Campaign.findOneAndUpdate(
        { onChainAddress: campaignAddress.toLowerCase() },
        {
          status: "pending_approval",
          approvalProposalId: proposalId.toString(),
        },
        { returnDocument: "after" }
      )
    }

    if (milestoneId !== undefined && milestoneId !== null && campaignAddress) {
      await Milestone.findOneAndUpdate(
        {
          campaignAddress: campaignAddress.toLowerCase(),
          milestoneId: milestoneId,
        },
        {
          status: "voting",
          proposalId: proposalId.toString(),
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Proposal successfully recorded in database",
      proposal: newProposal,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Governance propose API error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to create proposal record" },
      { status: 500 }
    )
  }
}

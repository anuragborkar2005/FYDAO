import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Campaign from "@/models/campaign"

export async function POST(request: NextRequest) {
  try {
    const { campaignAddress, proposalId } = await request.json()

    if (!campaignAddress || !proposalId) {
      return NextResponse.json(
        { error: "Missing campaignAddress or proposalId" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const campaign = await Campaign.findOneAndUpdate(
      { onChainAddress: campaignAddress.toLowerCase() },
      {
        status: "pending_approval",
        approvalProposalId: proposalId,
      },
      { returnDocument: "after" }
    )

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      campaign,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

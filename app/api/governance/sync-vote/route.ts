import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Proposal from "@/models/proposal"

export async function POST(request: NextRequest) {
  try {
    const { proposalId, support, weight, voter, txHash } = await request.json()

    await connectToDatabase()

    const numericWeight = parseFloat(weight || "0")

    const updateField =
      support === 1
        ? "votesFor"
        : support === 0
          ? "votesAgainst"
          : "votesAbstain"

    const proposal = await Proposal.findOneAndUpdate(
      { proposalId: proposalId.toString() },
      {
        $inc: { [updateField]: numericWeight },
        $push: {
          recentVoters: {
            address: voter,
            support,
            weight: numericWeight,
            txHash,
          },
        },
      },
      { new: true }
    )

    return NextResponse.json({ success: true, proposal })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

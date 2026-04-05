import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Vote from "@/models/vote"
import Proposal from "@/models/proposal"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    await connectToDatabase()

    const votes = await Vote.find({ voter: address.toLowerCase() }).sort({
      createdAt: -1,
    })

    // Populate proposal data manually
    const proposalIds = votes.map((v) => v.proposalId)
    const proposals = await Proposal.find({ proposalId: { $in: proposalIds } })

    const proposalMap = proposals.reduce((acc, p) => {
      acc[p.proposalId] = p
      return acc
    }, {})

    const populatedVotes = votes.map((v) => ({
      ...v.toObject(),
      proposal: proposalMap[v.proposalId] || null,
    }))

    return NextResponse.json({ success: true, votes: populatedVotes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

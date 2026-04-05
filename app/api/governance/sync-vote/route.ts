import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Proposal from "@/models/proposal"
import Vote from "@/models/vote"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Sync-vote request body:", body)

    const { proposalId, support, weight, voter, txHash } = body

    if (!proposalId || support === undefined || weight === undefined || !voter) {
      console.error("Missing required fields in sync-vote:", {
        proposalId: !!proposalId,
        support: support !== undefined,
        weight: weight !== undefined,
        voter: !!voter,
      })
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            proposalId: !proposalId ? "Missing" : "Present",
            support: support === undefined ? "Missing" : "Present",
            weight: weight === undefined ? "Missing" : "Present",
            voter: !voter ? "Missing" : "Present",
          },
        },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Sanitize weight string (remove commas)
    const sanitizedWeight = weight.toString().replace(/,/g, "")
    const numericWeight = parseFloat(sanitizedWeight || "0")

    if (isNaN(numericWeight)) {
      return NextResponse.json(
        { error: "Invalid weight format", received: weight },
        { status: 400 }
      )
    }

    const updateField =
      support === 1
        ? "votesFor"
        : support === 0
          ? "votesAgainst"
          : "votesAbstain"

    const proposal = await Proposal.findOne({
      proposalId: proposalId.toString(),
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Check if vote already exists to avoid double counting in totals
    const existingVote = await Vote.findOne({
      proposalId: proposalId.toString(),
      voter: voter.toLowerCase(),
    })

    if (existingVote) {
      return NextResponse.json(
        { message: "Vote already recorded", proposal },
        { status: 200 }
      )
    }

    // Record individual vote
    await Vote.create({
      proposalId: proposalId.toString(),
      voter: voter.toLowerCase(),
      support,
      weight: numericWeight,
      txHash,
    })

    const currentWeight = parseFloat((proposal as any)[updateField] || "0")
    ;(proposal as any)[updateField] = (currentWeight + numericWeight).toString()

    await proposal.save()

    return NextResponse.json({ success: true, proposal })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Campaign from "@/models/campaign"
import Milestone from "@/models/milestone"
import Proposal from "@/models/proposal"
import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

const PROPOSAL_STATES = [
  "pending",
  "active",
  "canceled",
  "defeated",
  "succeeded",
  "queued",
  "expired",
  "executed",
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await connectToDatabase()

    const { address } = await params

    if (!address) {
      return NextResponse.json({ error: "Address missing" }, { status: 400 })
    }

    const campaign = await Campaign.findOne({
      onChainAddress: address.toLowerCase(),
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Fetch milestones for this campaign
    const milestones = await Milestone.find({
      campaignAddress: address.toLowerCase(),
    }).sort({ milestoneId: 1 })

    // Enrich milestones with proposal status if they have one
    const enrichedMilestones = await Promise.all(
      milestones.map(async (m) => {
        const milestoneObj = m.toObject()
        if (m.proposalId) {
          try {
            const proposal = await Proposal.findOne({
              proposalId: m.proposalId,
            })
            if (proposal) {
              try {
                // Get real-time status from Governor
                const stateResult = await publicClient.readContract({
                  address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
                  abi: ABIS.DAOGovernor,
                  functionName: "state",
                  args: [BigInt(m.proposalId)],
                })

                milestoneObj.daoProposal = {
                  ...proposal.toObject(),
                  status: PROPOSAL_STATES[stateResult as number].toLowerCase(),
                }
              } catch {
                // Handle case where proposal ID exists in DB but not on-chain
                console.warn(
                  `Proposal ${m.proposalId} not found on-chain. Using DB status.`
                )
                milestoneObj.daoProposal = {
                  ...proposal.toObject(),
                  status: (proposal.status || "pending").toLowerCase(),
                  isStale: true,
                }
              }
            }
          } catch (dbError) {
            console.error("Failed to fetch proposal from database", dbError)
          }
        }
        return milestoneObj
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        ...campaign.toObject(),
        milestones: enrichedMilestones,
      },
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

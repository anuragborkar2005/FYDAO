import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Campaign from "@/models/campaign"
import Milestone from "@/models/milestone"
import { getIpfsUrl } from "@/utils/ipfs"

export async function GET(request: NextRequest) {
  try {
    const address =
      request.headers.get("x-wallet-address") ||
      request.nextUrl.searchParams.get("address")

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const myCampaigns = await Campaign.find({
      creator: address.toLowerCase(),
    }).sort({ createdAt: -1 })

    const enriched = await Promise.all(
      myCampaigns.map(async (c) => {
        const milestones = await Milestone.find({
          campaignAddress: c.onChainAddress.toLowerCase(),
        }).sort({ milestoneId: 1 })

        const campaignObj = c.toObject()
        if (!campaignObj.title && campaignObj.metadataCid) {
          try {
            const res = await fetch(getIpfsUrl(campaignObj.metadataCid))
            if (res.ok) {
              const metadata = await res.json()
              campaignObj.title = metadata.title
              campaignObj.description = metadata.description
              campaignObj.category = metadata.category
            }
          } catch (e) {
            console.error("Failed to fetch metadata for my campaign list", e)
          }
        }

        return {
          ...campaignObj,
          milestones,
        }
      })
    )

    return NextResponse.json({
      success: true,
      campaigns: enriched,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

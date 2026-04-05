import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Campaign from "@/models/campaign"
import { getIpfsUrl } from "@/utils/ipfs"

export async function GET() {
  try {
    await connectToDatabase()

    const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).limit(50)

    const enrichedCampaigns = await Promise.all(
      campaigns.map(async (c) => {
        const campaignObj = c.toObject()
        if (!campaignObj.title && campaignObj.metadataCid) {
          try {
            const res = await fetch(getIpfsUrl(campaignObj.metadataCid))
            if (res.ok) {
              const metadata = await res.json()
              return {
                ...campaignObj,
                title: metadata.title,
                description: metadata.description,
                category: metadata.category,
              }
            }
          } catch (e) {
            console.error("Failed to fetch metadata for campaign list", e)
          }
        }
        return campaignObj
      })
    )

    return NextResponse.json({
      success: true,
      campaigns: enrichedCampaigns,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

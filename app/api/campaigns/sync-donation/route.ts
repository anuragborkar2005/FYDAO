import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Donation from "@/models/donation"
import Campaign from "@/models/campaign"
import { IDonation } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body: IDonation = await request.json()
    const { campaignAddress, donor, amount, txHash, blockNumber } = body

    if (!txHash || !campaignAddress) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const donation = await Donation.findOneAndUpdate(
      { txHash: txHash.toLowerCase() },
      {
        campaignAddress: campaignAddress.toLowerCase(),
        donor: donor.toLowerCase(),
        amount,
        txHash: txHash.toLowerCase(),
        blockNumber: Number(blockNumber),
        status: "confirmed",
      },
      { upsert: true, new: true }
    )

    await Campaign.findOneAndUpdate(
      { onChainAddress: campaignAddress.toLowerCase() },
      {
        $inc: { totalRaised: parseFloat(amount) },
      }
    )

    return NextResponse.json({
      success: true,
      donationId: donation._id,
    })
  } catch (error: any) {
    console.error("Donation Sync Error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

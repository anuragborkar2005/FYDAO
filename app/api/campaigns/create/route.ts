import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Campaign from "@/models/campaign"

export async function POST(request: NextRequest) {
  try {
    const {
      onChainAddress,
      escrowAddress,
      creator,
      title,
      description,
      category,
      metadataCid,
      fileCid,
      targetAmount = "0",
      factoryTxHash,
      aiReview,
    } = await request.json()

    if (!onChainAddress || !creator || !metadataCid || !fileCid) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: onChainAddress, creator, metadataCid, fileCid",
        },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const campaign = await Campaign.findOneAndUpdate(
      { onChainAddress: onChainAddress.toLowerCase() },
      {
        onChainAddress: onChainAddress.toLowerCase(),
        escrowAddress: escrowAddress?.toLowerCase(),
        creator: creator.toLowerCase(),
        title,
        description,
        category,
        metadataCid,
        fileCid,
        targetAmount,
        factoryTxHash,
        aiReview,
        status: "created",
        isLive: false,
        raisedAmount: "0",
        $setOnInsert: { createdAt: new Date() },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    )

    return NextResponse.json({
      success: true,
      campaign,
      message: "Campaign saved/updated successfully",
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("MongoDB create campaign error:", error)
    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 }
    )
  }
}

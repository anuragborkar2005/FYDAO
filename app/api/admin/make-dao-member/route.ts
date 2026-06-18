import { connectToDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"

const ADMIN_ADDRESSES = [
  "0xD90bd4431dCD3abDd2c8958Ff4a1FCA9B1e0f0AE".toLowerCase(),
]

export async function POST(request: NextRequest) {
  try {
    const { targetAddress, amount } = await request.json()

    if (!targetAddress || !amount) {
      return NextResponse.json(
        { error: "targetAddress and amount are required" },
        { status: 400 }
      )
    }

    const caller = request.headers.get("x-wallet-address")?.toLowerCase()
    if (!caller || !ADMIN_ADDRESSES.includes(caller)) {
      return NextResponse.json(
        { error: "Unauthorized: Admin only" },
        { status: 403 }
      )
    }

    await connectToDatabase()

    return NextResponse.json({
      success: true,
      message: `DAO Member status granted to ${targetAddress} with ${amount} tokens`,
      targetAddress,
      amount,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Admin make-dao-member error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

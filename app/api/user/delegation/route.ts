import { NextRequest, NextResponse } from "next/server"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"
import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 })
    }

    const delegates = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.GovernanceToken as `0x${string}`,
      abi: ABIS.GovernanceToken,
      functionName: "delegates",
      args: [address as `0x${string}`],
    })

    const hasDelegated =
      delegates !== "0x0000000000000000000000000000000000000000"

    return NextResponse.json({
      success: true,
      hasDelegated,
      delegatesTo: delegates,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

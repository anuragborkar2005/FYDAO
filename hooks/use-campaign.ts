"use client"

import { getIpfsUrl } from "@/utils/ipfs"
import { useQuery } from "@tanstack/react-query"
import { createPublicClient, formatEther, http } from "viem"
import { sepolia } from "viem/chains"
import { ABIS } from "@/contracts/config"

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export function useCampaign(campaignAddress: string) {
  return useQuery({
    queryKey: ["campaign", campaignAddress],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${campaignAddress}/status`)
      if (!res.ok) throw new Error("Failed to fetch campaign")
      const data = await res.json()
      const campaign = data.data

      if (!campaign) return null

      try {
        const results = await publicClient.multicall({
          contracts: [
            {
              address: campaignAddress as `0x${string}`,
              abi: ABIS.Campaign,
              functionName: "isLive",
            },
            {
              address: campaignAddress as `0x${string}`,
              abi: ABIS.Campaign,
              functionName: "escrow",
            },
          ],
        })

        if (results[0].status === "success") {
          const isLiveOnChain = results[0].result as boolean
          if (isLiveOnChain) {
            campaign.isLive = true
            campaign.status = "live"
          }
        }

        if (results[1].status === "success") {
          const escrowAddress = results[1].result as `0x${string}`
          const totalDeposited = (await publicClient.readContract({
            address: escrowAddress,
            abi: ABIS.MilestoneEscrow,
            functionName: "totalDeposited",
          })) as bigint
          campaign.raisedAmount = formatEther(totalDeposited).toString()
        }
      } catch (err) {
        console.error("Failed to sync campaign state on-chain:", err)
      }

      if (campaign.metadataCid) {
        try {
          const metadataUrl = getIpfsUrl(campaign.metadataCid)
          const metadataRes = await fetch(metadataUrl)
          const metadata = await metadataRes.json()

          campaign.metadata = metadata
        } catch (err) {
          console.warn("Failed to fetch metadata from IPFS:", err)
          campaign.metadata = {
            title: "Untitled Campaign",
            description: "Metadata unavailable",
            targetAmount: "0",
            category: "Unknown",
          }
        }
      }

      return campaign
    },
    refetchInterval: 10000,
    enabled: !!campaignAddress,
  })
}

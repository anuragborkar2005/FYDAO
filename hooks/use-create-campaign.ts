import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { decodeEventLog } from "viem"
import { useConnection, useWriteContract } from "wagmi"

export function useCreateCampaign() {
  const { address } = useConnection()
  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationKey: ["createCampaign"],
    mutationFn: async ({
      metadataURI,
      targetAmount,
      trustScore,
    }: {
      metadataURI: string
      targetAmount: string
      trustScore: number
    }) => {
      if (!address) throw new Error("Wallet not connected")

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.CampaignFactory as `0x${string}`,
        abi: ABIS.CampaignFactory,
        functionName: "createCampaign",
        args: [CONTRACT_ADDRESSES.MockUSDC, metadataURI, BigInt(trustScore)],
      })

      return { hash, metadataURI, targetAmount }
    },
  })

  const syncToDb = async (receipt: any, vars: any, hash: string) => {
    let campaignAddr = ""
    let escrowAddr = ""

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: ABIS.CampaignFactory,
          data: log.data,
          topics: log.topics,
        })
        if (decoded.eventName === "CampaignCreated") {
          const args = decoded.args as any
          campaignAddr = args.campaign || args[0] || ""
          escrowAddr = args.escrow || args[1] || ""
          break
        }
      } catch (e) {
        continue
      }
    }

    const payload = {
      onChainAddress:
        campaignAddr.toLowerCase() || `0xPENDING_${hash.slice(2, 10)}`,
      escrowAddress: escrowAddr.toLowerCase(),
      creator: address?.toLowerCase(),
      metadataCid: vars.metadataURI,
      targetAmount: vars.targetAmount,
      factoryTxHash: hash,
    }

    const response = await fetch("/api/campaigns/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    return response.json()
  }

  return {
    createCampaign: mutation.mutateAsync,
    isLoading: mutation.isPending,
    hash: mutation.data?.hash,
    syncToDb,
  }
}

"use client"

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"
import { encodeFunctionData, decodeEventLog } from "viem"

export type MilestoneStep =
  | "idle"
  | "proposing-on-chain"
  | "creating-dao-proposal"
  | "syncing"

interface ProposeMilestoneArgs {
  proofCid: string
  amount: string
  aiResult?: any
}

export function useProposeMilestone(campaignAddress: `0x${string}`) {
  const { address } = useConnection()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationKey: ["proposeMilestone", campaignAddress],
    mutationFn: async ({
      proofCid,
      amount,
      aiResult,
    }: ProposeMilestoneArgs) => {
      if (!address) throw new Error("Wallet not connected")

      const scaledAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000))

      const tx1Hash = await writeContractAsync({
        address: campaignAddress,
        abi: ABIS.Campaign,
        functionName: "proposeMilestone",
        args: [proofCid, scaledAmount],
      })

      return { tx1Hash, proofCid, amount, aiResult }
    },
  })

  const tx1Receipt = useWaitForTransactionReceipt({
    hash: mutation.data?.tx1Hash,
  })

  const flowMutation = useMutation({
    mutationKey: ["milestoneFlow", mutation.data?.tx1Hash],
    mutationFn: async (receipt: any) => {
      const { proofCid, amount, aiResult } = mutation.variables!

      let milestoneId: bigint | null = null
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ABIS.Campaign,
            data: log.data,
            topics: log.topics,
          })
          if (decoded.eventName === "MilestoneProposed") {
            milestoneId = BigInt(
              (decoded.args as any).id || (decoded.args as any)[0]
            )
            break
          }
        } catch {
          continue
        }
      }

      if (milestoneId === null)
        throw new Error("Milestone ID not found in logs")

      const releaseCalldata = encodeFunctionData({
        abi: ABIS.Campaign,
        functionName: "releaseMilestone",
        args: [milestoneId],
      })

      const tx2Hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "propose",
        args: [
          [campaignAddress],
          [0n],
          [releaseCalldata],
          `Release Milestone ${milestoneId} for Campaign ${campaignAddress}: ${amount} USDC. Proof: ${proofCid}`,
        ],
      })

      return { tx2Hash, milestoneId, proofCid, amount, aiResult }
    },
  })

  const tx2Receipt = useWaitForTransactionReceipt({
    hash: flowMutation.data?.tx2Hash,
  })

  const syncMutation = useMutation({
    mutationFn: async (receipt: any) => {
      let proposalId = ""
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ABIS.DAOGovernor,
            data: log.data,
            topics: log.topics,
          })
          if (decoded.eventName === "ProposalCreated") {
            proposalId = (decoded.args as any).proposalId.toString()
            break
          }
        } catch {
          continue
        }
      }

      const response = await fetch("/api/campaigns/propose-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignAddress,
          proofCid: flowMutation.data?.proofCid,
          amount: flowMutation.data?.amount,
          proposalId,
          aiResult: flowMutation.data?.aiResult,
        }),
      })

      if (!response.ok) throw new Error("Failed to sync to MongoDB")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["milestones", campaignAddress],
      })
    },
  })

  if (
    tx1Receipt.isSuccess &&
    !flowMutation.isPending &&
    !flowMutation.isSuccess &&
    !flowMutation.isError
  ) {
    flowMutation.mutate(tx1Receipt.data)
  }
  if (
    tx2Receipt.isSuccess &&
    !syncMutation.isPending &&
    !syncMutation.isSuccess &&
    !syncMutation.isError
  ) {
    syncMutation.mutate(tx2Receipt.data)
  }

  const getStep = (): MilestoneStep => {
    if (syncMutation.isPending) return "syncing"
    if (flowMutation.isPending || tx2Receipt.isLoading)
      return "creating-dao-proposal"
    if (mutation.isPending || tx1Receipt.isLoading) return "proposing-on-chain"
    return "idle"
  }

  return {
    proposeMilestone: mutation.mutate,
    currentStep: getStep(),
    isLoading:
      mutation.isPending ||
      tx1Receipt.isLoading ||
      flowMutation.isPending ||
      tx2Receipt.isLoading ||
      syncMutation.isPending,
    isSuccess: syncMutation.isSuccess,
    error: mutation.error || flowMutation.error || syncMutation.error,
    txHashes: {
      milestoneTx: mutation.data?.tx1Hash,
      governorTx: flowMutation.data?.tx2Hash,
    },
  }
}

"use client"

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"
import { useGovernanceToken } from "./use-governance-token"

interface VoteArgs {
  proposalId: string
  support: 0 | 1 | 2
}

export function useVote() {
  const { address } = useConnection()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()

  const { votingPower } = useGovernanceToken()

  const mutation = useMutation({
    mutationKey: ["governance", "vote"],
    mutationFn: async ({ proposalId, support }: VoteArgs) => {
      if (!address) throw new Error("Wallet not connected")

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "castVote",
        args: [BigInt(proposalId), support],
      })

      return { hash, proposalId, support }
    },
  })

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isMined,
  } = useWaitForTransactionReceipt({
    hash: mutation.data?.hash,
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { proposalId, support } = mutation.variables!

      const response = await fetch("/api/governance/sync-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          voter: address,
          support,
          weight: votingPower?.toString() || "0",
          txHash: mutation.data?.hash,
        }),
      })

      if (!response.ok) throw new Error("Failed to sync vote to DB")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-proposals"] })
      queryClient.invalidateQueries({
        queryKey: ["proposal", mutation.variables?.proposalId],
      })
      console.log("✅ Vote successfully recorded on-chain and in DB")
    },
  })

  if (
    isMined &&
    receipt &&
    !syncMutation.isPending &&
    !syncMutation.isSuccess
  ) {
    syncMutation.mutate()
  }

  return {
    vote: mutation.mutate,
    isLoading: mutation.isPending || isConfirming || syncMutation.isPending,
    isSuccess: syncMutation.isSuccess,
    error: mutation.error || syncMutation.error,
    txHash: mutation.data?.hash,
    status: mutation.isPending
      ? "Confirming in Wallet..."
      : isConfirming
        ? "Casting Vote..."
        : syncMutation.isPending
          ? "Updating Results..."
          : "Idle",
  }
}

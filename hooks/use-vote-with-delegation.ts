"use client"

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sepolia } from "viem/chains"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"
import { useUserRole } from "./use-user-role"

export function useVoteWithDelegation() {
  const { address } = useAccount()
  const { canVote, votingPower } = useUserRole()
  const queryClient = useQueryClient()

  const { writeContractAsync } = useWriteContract()

  const delegationMutation = useMutation({
    mutationKey: ["governance", "delegate"],
    mutationFn: async (toAddress?: `0x${string}`) => {
      const target = toAddress || address
      if (!target) throw new Error("No address to delegate to")

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.GovernanceToken as `0x${string}`,
        abi: ABIS.GovernanceToken,
        functionName: "delegate",
        args: [target],
        chainId: sepolia.id,
      })
      return { hash }
    },
  })

  const txDelegate = useWaitForTransactionReceipt({
    hash: delegationMutation.data?.hash,
  })

  const voteMutation = useMutation({
    mutationKey: ["governance", "castVote"],
    mutationFn: async ({
      proposalId,
      support,
    }: {
      proposalId: string
      support: number
    }) => {
      if (!canVote) throw new Error("Delegation required to vote")

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "castVote",
        args: [BigInt(proposalId), support],
        chainId: sepolia.id,
      })

      return { hash, proposalId, support }
    },
  })

  const txVote = useWaitForTransactionReceipt({
    hash: voteMutation.data?.hash,
  })

  const syncVoteMutation = useMutation({
    mutationFn: async () => {
      const { proposalId, support } = voteMutation.variables!

      const response = await fetch("/api/governance/sync-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          voter: address,
          support,
          weight: votingPower,
          txHash: voteMutation.data?.hash,
        }),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-proposals"] })
      queryClient.invalidateQueries({
        queryKey: ["delegation-status", address],
      })
    },
  })

  if (
    txVote.isSuccess &&
    !syncVoteMutation.isPending &&
    !syncVoteMutation.isSuccess
  ) {
    syncVoteMutation.mutate(txVote.data)
  }

  if (txDelegate.isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["delegation-status", address] })
    queryClient.invalidateQueries({ queryKey: ["governance-token"] })
  }

  return {
    delegate: delegationMutation.mutate,
    castVote: voteMutation.mutate,

    isDelegating: delegationMutation.isPending || txDelegate.isLoading,
    isVoting:
      voteMutation.isPending || txVote.isLoading || syncVoteMutation.isPending,

    canVote,
    isVoteSuccess: syncVoteMutation.isSuccess,
    error:
      voteMutation.error || delegationMutation.error || syncVoteMutation.error,
  }
}

"use client"

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { keccak256, stringToHex } from "viem"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"

interface QueueArgs {
  proposalId: string
  targets: string[]
  values: string[]
  calldatas: string[]
  description: string
}

export function useQueue() {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationKey: ["governance", "queue"],
    mutationFn: async ({
      targets,
      values,
      calldatas,
      description,
      proposalId,
    }: QueueArgs) => {
      if (!address) throw new Error("Wallet not connected")

      const descriptionHash = keccak256(stringToHex(description))

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "queue",
        args: [
          targets,
          values.map((v) => BigInt(v)),
          calldatas,
          descriptionHash,
        ],
      })

      return { hash, proposalId }
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
      const response = await fetch("/api/governance/sync-proposal-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: mutation.variables?.proposalId,
          status: "queued",
          txHash: mutation.data?.hash,
        }),
      })
      if (!response.ok) throw new Error("Failed to update proposal state")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-proposals"] })
      queryClient.invalidateQueries({
        queryKey: ["proposal", mutation.variables?.proposalId],
      })
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
    queue: mutation.mutate,
    isLoading: mutation.isPending || isConfirming || syncMutation.isPending,
    isSuccess: syncMutation.isSuccess,
    error: mutation.error || syncMutation.error,
    txHash: mutation.data?.hash,
    status: mutation.isPending
      ? "Signing..."
      : isConfirming
        ? "Queueing..."
        : syncMutation.isPending
          ? "Updating DB..."
          : "Idle",
  }
}

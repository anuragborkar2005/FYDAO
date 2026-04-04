"use client"

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { keccak256, stringToHex } from "viem"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"

interface ExecuteArgs {
  proposalId: string
  targets: string[]
  values: string[]
  calldatas: string[]
  description: string
}

export function useExecute() {
  const { address } = useConnection()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationKey: ["governance", "execute"],
    mutationFn: async ({
      targets,
      values,
      calldatas,
      description,
      proposalId,
    }: ExecuteArgs) => {
      if (!address) throw new Error("Wallet not connected")

      const descriptionHash = keccak256(stringToHex(description))

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "execute",
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
          status: "executed",
          txHash: mutation.data?.hash,
          finalizedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to finalize proposal in DB")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-proposals"] })
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      queryClient.invalidateQueries({ queryKey: ["milestones"] })

      console.log("✅ Proposal executed and state synchronized.")
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
    execute: mutation.mutate,
    isLoading: mutation.isPending || isConfirming || syncMutation.isPending,
    isSuccess: syncMutation.isSuccess,
    error: mutation.error || syncMutation.error,
    txHash: mutation.data?.hash,
    statusText: mutation.isPending
      ? "Confirming Execution..."
      : isConfirming
        ? "Processing Timelock..."
        : syncMutation.isPending
          ? "Finalizing Records..."
          : "Idle",
  }
}

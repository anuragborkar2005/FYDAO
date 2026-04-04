"use client"

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { parseUnits } from "viem"
import { sepolia } from "viem/chains"
import { ABIS } from "@/contracts/config"

interface DonateArgs {
  amount: string
}

export function useDonate(campaignAddress: `0x${string}`) {
  const { address } = useConnection()
  const queryClient = useQueryClient()

  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationKey: ["donate", campaignAddress],
    mutationFn: async ({ amount }: DonateArgs) => {
      if (!address) throw new Error("Wallet not connected")

      const scaledAmount = parseUnits(amount, 6)

      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: ABIS.Campaign,
        functionName: "donate",
        args: [scaledAmount],
        chainId: sepolia.id,
      })

      return { hash, amount }
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
    mutationFn: async (receiptData: any) => {
      const response = await fetch("/api/campaigns/sync-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignAddress,
          donor: address,
          amount: mutation.variables?.amount,
          txHash: mutation.data?.hash,
          blockNumber: receiptData.blockNumber.toString(),
        }),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignAddress] })
      queryClient.invalidateQueries({
        queryKey: ["donations", campaignAddress],
      })
      queryClient.invalidateQueries({ queryKey: ["balances", address] })

      console.log("Donation processed and UI refreshed!")
    },
  })

  if (
    isMined &&
    receipt &&
    !syncMutation.isPending &&
    !syncMutation.isSuccess
  ) {
    syncMutation.mutate(receipt)
  }

  return {
    donate: mutation.mutate,
    isLoading: mutation.isPending || isConfirming || syncMutation.isPending,
    isSuccess: syncMutation.isSuccess,
    isError: mutation.isError || syncMutation.isError,
    error: mutation.error || syncMutation.error,
    txHash: mutation.data?.hash,
    status: mutation.isPending
      ? "Confirm in Wallet"
      : isConfirming
        ? "Mining Transaction..."
        : syncMutation.isPending
          ? "Updating Dashboard..."
          : "Idle",
  }
}

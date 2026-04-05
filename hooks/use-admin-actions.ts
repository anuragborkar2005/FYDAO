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

interface MakeDaoMemberArgs {
  targetAddress: `0x${string}`
  amount: string
}

export function useAdminActions() {
  const { address } = useAccount()
  const { isAdmin } = useUserRole()
  const queryClient = useQueryClient()

  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationKey: ["admin", "makeDaoMember"],
    mutationFn: async ({ targetAddress, amount }: MakeDaoMemberArgs) => {
      if (!isAdmin) throw new Error("Unauthorized: Admin role required")
      if (!address) throw new Error("Wallet not connected")
      const scaledAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000))

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.GovernanceToken as `0x${string}`,
        abi: ABIS.GovernanceToken,
        functionName: "mint",
        args: [targetAddress, scaledAmount],
        chainId: sepolia.id,
      })

      return { hash, targetAddress, amount }
    },
  })

  const { isLoading: isConfirming, isSuccess: isMined } =
    useWaitForTransactionReceipt({
      hash: mutation.data?.hash,
    })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { targetAddress, amount } = mutation.variables!

      const response = await fetch("/api/admin/make-dao-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": address!,
        },
        body: JSON.stringify({
          targetAddress: targetAddress.toLowerCase(),
          amount,
          txHash: mutation.data?.hash,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to sync admin action")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-token"] })
      queryClient.invalidateQueries({ queryKey: ["delegation-status"] })
      console.log("Admin action synced to database")
    },
  })

  if (
    isMined &&
    !syncMutation.isPending &&
    !syncMutation.isSuccess &&
    !syncMutation.isError
  ) {
    syncMutation.mutate()
  }

  return {
    makeDaoMember: mutation.mutate,
    isLoading: mutation.isPending || isConfirming || syncMutation.isPending,
    isSuccess: syncMutation.isSuccess,
    error: mutation.error || syncMutation.error,
    txHash: mutation.data?.hash,
    isAdmin,
  }
}

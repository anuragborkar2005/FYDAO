"use client"

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { encodeFunctionData, decodeEventLog } from "viem"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"

interface ProposeArgs {
  description?: string
}

export function useApproveCampaign(campaignAddress: `0x${string}`) {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationKey: ["proposeApproval", campaignAddress],
    mutationFn: async ({ description }: ProposeArgs = {}) => {
      if (!address) throw new Error("Wallet not connected")

      const approveCalldata = encodeFunctionData({
        abi: ABIS.Campaign,
        functionName: "approveAndGoLive",
        args: [],
      })

      const proposalDescription =
        description || `Approve Campaign ${campaignAddress}`

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "propose",
        args: [[campaignAddress], [0n], [approveCalldata], proposalDescription],
      })

      return { hash, proposalDescription }
    },
  })

  // 3. Wait for Receipt
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isMined,
  } = useWaitForTransactionReceipt({
    hash: mutation.data?.hash,
  })

  const syncMutation = useMutation({
    mutationKey: ["syncProposal", mutation.data?.hash],
    mutationFn: async (receiptData: any) => {
      let proposalId = ""

      for (const log of receiptData.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ABIS.DAOGovernor,
            data: log.data,
            topics: log.topics,
          })

          if (decoded.eventName === "ProposalCreated") {
            proposalId = (decoded.args as any).proposalId?.toString()
            break
          }
        } catch {
          continue
        }
      }

      const response = await fetch("/api/proposals/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          campaignAddress,
          proposer: address,
          description: mutation.data?.proposalDescription,
          transactionHash: mutation.data?.hash,
        }),
      })

      if (!response.ok) throw new Error("Failed to sync proposal to DB")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] })
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignAddress] })
    },
  })

  if (
    isMined &&
    receipt &&
    !syncMutation.isPending &&
    !syncMutation.isSuccess &&
    !syncMutation.isError
  ) {
    syncMutation.mutate(receipt)
  }

  const getStatusText = () => {
    if (mutation.isPending) return "Waiting for Wallet..."
    if (isConfirming) return "Proposing to DAO..."
    if (syncMutation.isPending) return "Recording Proposal..."
    if (syncMutation.isSuccess) return "Proposal Submitted!"
    return "Idle"
  }

  return {
    proposeApproval: mutation.mutate,
    isLoading: mutation.isPending || isConfirming || syncMutation.isPending,
    isSuccess: syncMutation.isSuccess,
    isError: mutation.isError || syncMutation.isError,
    error: mutation.error || syncMutation.error,
    statusText: getStatusText(),
    txHash: mutation.data?.hash,
    proposalData: syncMutation.data,
  }
}

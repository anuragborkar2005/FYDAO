"use client"

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { encodeFunctionData, decodeEventLog } from "viem"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"

export function useProposeApproval(campaignAddress: `0x${string}`) {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationKey: ["proposeApproval", campaignAddress],
    mutationFn: async () => {
      if (!address) throw new Error("Please connect your wallet")

      const approveCalldata = encodeFunctionData({
        abi: ABIS.Campaign,
        functionName: "approveAndGoLive",
        args: [],
      })
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "propose",
        args: [
          [campaignAddress],
          [0n],
          [approveCalldata],
          `Approve Campaign: ${campaignAddress}`,
        ],
      })

      return { hash }
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
            const args = decoded.args as any
            proposalId = (args.proposalId || args[0]).toString()
            break
          }
        } catch {
          continue
        }
      }

      const description = `Approve Campaign: ${campaignAddress}`

      if (!proposalId)
        throw new Error("Proposal ID not found in transaction logs")

      const response = await fetch("/api/governance/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          description,
          targets: [campaignAddress],
          values: ["0"],
          calldatas: [
            encodeFunctionData({
              abi: ABIS.Campaign,
              functionName: "approveAndGoLive",
              args: [],
            }),
          ],
          proposer: address,
          isCampaignApproval: true,
          campaignAddress,
        }),
      })

      if (!response.ok) throw new Error("Failed to sync proposal to server")
      return { proposalId, ...(await response.json()) }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] })
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignAddress] })
      console.log("Proposal synced:", data.proposalId)
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

  return {
    proposeApproval: mutation.mutate,
    isLoading: mutation.isPending || isConfirming || syncMutation.isPending,
    isSuccess: syncMutation.isSuccess,
    isError: mutation.isError || syncMutation.isError,
    error: mutation.error || syncMutation.error,
    txHash: mutation.data?.hash,
    proposalId: syncMutation.data?.proposalId,
  }
}

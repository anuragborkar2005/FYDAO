"use client"

import { useQuery } from "@tanstack/react-query"
import { useReadContract } from "wagmi"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"
import { useMemo } from "react"

const STATE_MAP: Record<number, string> = {
  0: "pending",
  1: "active",
  2: "canceled",
  3: "defeated",
  4: "succeeded",
  5: "queued",
  6: "expired",
  7: "executed",
}

export function useProposal(proposalId?: string) {
  const {
    data: dbProposal,
    isLoading: isDbLoading,
    refetch: refetchDb,
  } = useQuery({
    queryKey: ["proposal-db", proposalId],
    queryFn: async () => {
      if (!proposalId) return null
      const res = await fetch(`/api/governance/proposals?id=${proposalId}`)
      if (!res.ok) throw new Error("Failed to fetch proposal from database")
      const data = await res.json()
      return data.proposal || null
    },
    enabled: !!proposalId,
  })

  const {
    data: contractState,
    isLoading: isStateLoading,
    refetch: refetchState,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
    abi: ABIS.DAOGovernor,
    functionName: "state",
    args: proposalId ? [BigInt(proposalId)] : undefined,
    query: {
      enabled: !!proposalId,
      refetchInterval: 30000,
    },
  })

  const proposal = useMemo(() => {
    if (!dbProposal) return null

    const onChainStatus =
      contractState !== undefined ? STATE_MAP[Number(contractState)] : null

    return {
      ...dbProposal,
      status: onChainStatus || dbProposal.status || "pending",
    }
  }, [dbProposal, contractState])

  const syncState = async () => {
    if (!proposalId || contractState === undefined) return

    const status = STATE_MAP[Number(contractState)]
    await fetch("/api/governance/sync-proposal-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposalId,
        status,
        campaignAddress: dbProposal?.campaignAddress,
      }),
    })
    refetchDb()
  }

  return {
    proposal,
    isLoading: isDbLoading || isStateLoading,
    refetch: () => {
      refetchDb()
      refetchState()
    },
    syncState,
  }
}

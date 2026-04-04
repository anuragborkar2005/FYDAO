"use client"

import { useQuery } from "@tanstack/react-query"
import { useReadContracts } from "wagmi"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"
import { useMemo } from "react"

export type ProposalState =
  | "Pending"
  | "Active"
  | "Canceled"
  | "Defeated"
  | "Succeeded"
  | "Queued"
  | "Expired"
  | "Executed"

const STATE_MAP: Record<number, ProposalState> = {
  0: "Pending",
  1: "Active",
  2: "Canceled",
  3: "Defeated",
  4: "Succeeded",
  5: "Queued",
  6: "Expired",
  7: "Executed",
}

export function useProposals() {
  const {
    data: dbProposals,
    isLoading: isDbLoading,
    error: dbError,
    refetch: refetchDb,
  } = useQuery({
    queryKey: ["governance-proposals-db"],
    queryFn: async () => {
      const res = await fetch("/api/governance/proposals")
      if (!res.ok) throw new Error("Failed to fetch proposals from database")
      const data = await res.json()
      return data.proposals || []
    },
    refetchInterval: 60000,
  })

  const { data: contractStates, isLoading: isStatesLoading } = useReadContracts(
    {
      contracts: (dbProposals || []).map((p: any) => ({
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "state",
        args: [BigInt(p.proposalId)],
      })),
      query: {
        enabled: !!dbProposals && dbProposals.length > 0,
        refetchInterval: 12000,
      },
    }
  )

  const proposals = useMemo(() => {
    if (!dbProposals) return []

    return dbProposals.map((proposal: any, index: number) => {
      const stateResult = contractStates?.[index]

      return {
        ...proposal,
        status:
          stateResult?.status === "success"
            ? STATE_MAP[Number(stateResult.result)]
            : proposal.status || "Unknown",
        onChainState: stateResult?.result,
        isClosable: stateResult?.result === 3 || stateResult?.result === 7,
      }
    })
  }, [dbProposals, contractStates])

  return {
    proposals,
    isLoading: isDbLoading || (isStatesLoading && !!dbProposals),
    isError: !!dbError,
    error: dbError,
    refetch: refetchDb,
  }
}

"use client"

import { useReadContracts, useConnection, useBlockNumber } from "wagmi"
import { ABIS, CONTRACT_ADDRESSES } from "@/contracts/config"
import { useMemo } from "react"

export function useGovernanceToken() {
  const { address } = useConnection()
  const { data: blockNumber } = useBlockNumber()

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESSES.GovernanceToken as `0x${string}`,
        abi: ABIS.GovernanceToken,
        functionName: "totalSupply",
      },
      {
        address: CONTRACT_ADDRESSES.GovernanceToken as `0x${string}`,
        abi: ABIS.GovernanceToken,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        address: CONTRACT_ADDRESSES.GovernanceToken as `0x${string}`,
        abi: ABIS.GovernanceToken,
        functionName: "getVotes",
        args: address ? [address] : undefined,
      },
      {
        address: CONTRACT_ADDRESSES.GovernanceToken as `0x${string}`,
        abi: ABIS.GovernanceToken,
        functionName: "delegates",
        args: address ? [address] : undefined,
      },
      {
        address: CONTRACT_ADDRESSES.DAOGovernor as `0x${string}`,
        abi: ABIS.DAOGovernor,
        functionName: "quorum",
        args: blockNumber ? [blockNumber - 1n] : undefined,
      },
    ],
    query: {
      enabled: !!blockNumber,
      staleTime: 10_000,
    },
  })

  const formattedData = useMemo(() => {
    const [
      totalSupplyRaw,
      balanceRaw,
      votingPowerRaw,
      delegatesRaw,
      quorumRaw,
    ] = data || []

    const format = (val: any) =>
      val?.result ? (Number(val.result) / 1e6).toLocaleString() : "0"

    const tsRaw = totalSupplyRaw?.result as bigint | undefined
    const qRaw = quorumRaw?.result as bigint | undefined

    return {
      totalSupply: format(totalSupplyRaw),
      balance: format(balanceRaw),
      votingPower: format(votingPowerRaw),
      delegates: delegatesRaw?.result as `0x${string}` | undefined,

      quorum:
        tsRaw && qRaw ? Math.round((Number(qRaw) / Number(tsRaw)) * 100) : 4,

      raw: {
        totalSupply: tsRaw,
        balance: balanceRaw?.result as bigint | undefined,
        votingPower: votingPowerRaw?.result as bigint | undefined,
        quorum: qRaw,
      },
    }
  }, [data])

  return {
    ...formattedData,
    isLoading,
    refetch,
  }
}

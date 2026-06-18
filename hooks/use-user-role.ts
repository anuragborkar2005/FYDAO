"use client"

import { useQuery } from "@tanstack/react-query"
import { useGovernanceToken } from "./use-governance-token"
import { useMemo } from "react"
import { useAccount } from "wagmi"

const ADMIN_ADDRESSES = (
  process.env.NEXT_PUBLIC_ADMIN_ADDRESSES ||
  "0xD90bd4431dCD3abDd2c8958Ff4a1FCA9B1e0f0AE"
).toLowerCase()

export function useUserRole() {
  const { address, isConnected } = useAccount()

  const { votingPower, raw, isLoading: isTokensLoading } = useGovernanceToken()

  const { data: delegationData, isLoading: isDelegationLoading } = useQuery({
    queryKey: ["delegation-status", address?.toLowerCase()],
    queryFn: async () => {
      if (!address) return { hasDelegated: false }
      const res = await fetch(
        `/api/user/delegation?address=${address.toLowerCase()}`
      )
      if (!res.ok) return { hasDelegated: false }
      return res.json()
    },
    enabled: !!address && isConnected,
    staleTime: 30000,
    placeholderData: { hasDelegated: false },
  })

  const userStats = useMemo(() => {
    const cleanAddress = address?.toLowerCase() || ""

    const hasVotingPower = (raw?.votingPower || 0n) > 0n
    const hasDelegated = delegationData?.hasDelegated || false

    const roles: string[] = ["donor"]

    if (hasVotingPower) {
      roles.push("dao_member_potential")
    }

    if (hasVotingPower && hasDelegated) {
      roles.push("dao_member")
    }

    if (ADMIN_ADDRESSES.includes(cleanAddress)) {
      roles.push("admin")
    }

    return {
      roles,
      hasVotingPower,
      hasDelegated,
      canVote: hasVotingPower && hasDelegated,
      isAdmin: roles.includes("admin"),
      isDaoMember: roles.includes("dao_member"),
    }
  }, [address, raw?.votingPower, delegationData?.hasDelegated])

  return {
    ...userStats,
    address,
    isConnected,
    votingPower,
    isLoading: isTokensLoading || isDelegationLoading,
    hasRole: (role: string) => userStats.roles.includes(role),
  }
}

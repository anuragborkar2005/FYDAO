"use client"

import { useQuery } from "@tanstack/react-query"
import { useGovernanceToken } from "./use-governance-token"
import { useMemo } from "react"
import { useConnection } from "wagmi"

const ADMIN_ADDRESSES = (
  process.env.NEXT_PUBLIC_ADMIN_ADDRESSES ||
  "0x3dEc9ada98b5f15779b29034311a29F7a893a590"
).toLowerCase()

export function useUserRole() {
  const { address, isConnected } = useConnection()

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

"use client"

import React, { useMemo } from "react"
import { useGovernanceToken } from "@/hooks/use-governance-token"
import { useVoteWithDelegation } from "@/hooks/use-vote-with-delegation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AiSecurityIcon,
  Blockchain02Icon,
  FingerPrintIcon,
  LoadingIcon,
  UserGroupIcon,
  ZapIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function GovernanceStats() {
  const {
    totalSupply,
    quorum,
    votingPower,
    balance,
    raw,
    isLoading: isFetchingData,
  } = useGovernanceToken()

  const { delegate, isDelegating, canVote } = useVoteWithDelegation()

  const needsDelegation = useMemo(() => {
    const hasBalance = raw.balance && raw.balance > 0n
    const hasNoPower = !raw.votingPower || raw.votingPower === 0n
    return hasBalance && hasNoPower
  }, [raw.balance, raw.votingPower])

  const stats = [
    {
      label: "My Voting Power",
      value: votingPower,
      subValue: `${balance} Tokens Held`,
      icon: <HugeiconsIcon icon={ZapIcon} className="text-primary" size={20} />,
      primary: true,
    },
    {
      label: "Current Quorum",
      value: `${quorum}%`,
      subValue: "Threshold for passing",
      icon: (
        <HugeiconsIcon
          icon={UserGroupIcon}
          className="text-muted-foreground"
          size={20}
        />
      ),
      primary: false,
    },
    {
      label: "Circulating Supply",
      value: totalSupply,
      subValue: "Total GOV Minted",
      icon: (
        <HugeiconsIcon
          icon={Blockchain02Icon}
          className="text-muted-foreground"
          size={20}
        />
      ),
      primary: false,
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* 1. Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className={`relative overflow-hidden border-border bg-card/60 transition-all duration-500 hover:bg-card/70 ${
              stat.primary
                ? "shadow-lg ring-1 shadow-primary/5 ring-primary/20"
                : ""
            }`}
          >
            {stat.primary && (
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-10 w-10 rounded-full bg-primary/10 blur-2xl" />
            )}

            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`rounded-lg border p-2.5 ${stat.primary ? "border-primary/20 bg-primary/10" : "border-border bg-secondary/50"}`}
                >
                  {stat.icon}
                </div>
                {isFetchingData && (
                  <HugeiconsIcon
                    icon={LoadingIcon}
                    className="animate-spin text-muted-foreground/30"
                    size={14}
                  />
                )}
              </div>

              <div className="space-y-1">
                <div
                  className={`text-3xl font-bold ${stat.primary ? "text-primary" : "text-foreground"}`}
                >
                  {stat.value}
                </div>
                <p className="text-sm font-bold text-muted-foreground">
                  {stat.label}
                </p>
              </div>

              <div className="mt-4 border-t border-border/50 pt-4">
                <p className="text-sm font-medium text-muted-foreground opacity-60">
                  {stat.subValue}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Urgent Call-to-Action: Delegation Prompt */}
      {needsDelegation && (
        <div className="group relative animate-in overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 duration-700 fade-in slide-in-from-top-4">
          <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-start gap-4">
              <div className="rounded-md border border-primary/30 bg-primary/20 p-3">
                <HugeiconsIcon
                  icon={FingerPrintIcon}
                  className="text-primary"
                  size={18}
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-primary">
                  Voting Rights Inactive
                </h4>
                <p className="max-w-sm text-xs leading-relaxed font-medium text-muted-foreground">
                  You hold {balance} tokens, but your voting weight is 0. You
                  must self-delegate to link your balance to the Governor.
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => delegate(undefined)}
              disabled={isDelegating}
              className="h-8 w-full rounded-md bg-primary px-8 font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              {isDelegating ? (
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={LoadingIcon}
                    className="animate-spin"
                    size={18}
                  />
                  <span>Syncing Chain...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={AiSecurityIcon} size={18} />
                  <span>Activate Power</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 3. Success State: Ready to Vote */}
      {canVote && !needsDelegation && (
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-bold text-muted-foreground">
            Verified Voter Status • Consensus Ready
          </span>
        </div>
      )}
    </div>
  )
}

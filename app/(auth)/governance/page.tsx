"use client"

import React from "react"
import { useProposals } from "@/hooks/use-proposals"
import ProposalList from "@/components/governance/proposal-list"
import GovernanceStats from "@/components/governance/governance-stats"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LeftToRightListDashIcon,
  ShieldIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

export default function GovernancePage() {
  const { proposals, isLoading, refetch } = useProposals()

  return (
    <div className="relative mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[5%] right-[10%] h-[35%] w-[35%] animate-pulse rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] h-[25%] w-[25%] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      {/* Header & Protocol Overview */}
      <div className="flex animate-in flex-col items-start gap-10 duration-700 slide-in-from-top-0 fade-in xl:flex-row xl:items-center">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-2.5">
              <HugeiconsIcon
                icon={ShieldIcon}
                className="h-4 w-4 text-primary"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Governance</h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground opacity-80">
            The decentralized heartbeat of FYDAO. Exercise your
            <span className="text-primary">GTK</span> power to authorize
            initiatives and release milestones.
          </p>
        </div>

        {/* Voting Power & Network Quorum Stats */}
        <div className="w-full min-w-125 xl:w-auto">
          <GovernanceStats />
        </div>
      </div>

      {/* Proposal Feed Section */}
      <div className="animate-in space-y-8 delay-200 duration-1000 fade-in slide-in-from-bottom-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-border bg-secondary/50 p-2">
              <HugeiconsIcon
                icon={LeftToRightListDashIcon}
                size={12}
                className="text-muted-foreground"
              />
            </div>
            <h2 className="text-sm font-bold text-muted-foreground">
              Active Proposals
            </h2>
          </div>
          <div className="hidden items-center gap-2 text-sm font-bold text-primary/40 md:flex">
            <div className="h-1 w-1 animate-ping rounded-full bg-primary" />
            Network Sync: Live
          </div>
        </div>

        <div className="group relative">
          <ProposalList
            proposals={proposals}
            isLoading={isLoading}
            refetch={refetch}
          />
        </div>
      </div>

      {/* Protocol Footer */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-12 opacity-50 sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold">FYDAO Governance Protocol</span>
        </div>
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={UserGroupIcon} size={14} />
          <span className="text-sm font-bold">
            Decentralized Tallying Active
          </span>
        </div>
      </div>
    </div>
  )
}

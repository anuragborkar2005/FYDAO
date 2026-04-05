"use client"

import React from "react"
import ProposalList from "@/components/governance/proposal-list"
import { useProposals } from "@/hooks/use-proposals"

import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  Blockchain02Icon,
  RefreshIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

export default function DashboardGovernancePage() {
  const { proposals, isLoading, refetch } = useProposals()

  return (
    <div className="animate-in space-y-10 duration-700 fade-in slide-in-from-bottom-2">
      {/* Header with Ledger Actions */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-primary/20 bg-primary/10 p-2.5">
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="h-4 w-4 text-primary"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-foreground">
              Consensus Feed
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground">
            The decentralized record of all campaign authorizations and fund
            release protocols within the FYDAO ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary/50 px-4 py-2 sm:flex">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-bold text-muted-foreground">
              Ledger Synchronized
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="rounded-md border-border transition-all hover:bg-primary/5 hover:text-primary"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Global Activity Stats (Subtle) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Network State",
            value: "Active",
            icon: <HugeiconsIcon icon={Activity01Icon} size={14} />,
          },
          {
            label: "Active Proposals",
            value: proposals.filter((p: any) => p.status === "active").length,
            icon: <HugeiconsIcon icon={Blockchain02Icon} size={14} />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-border/50 bg-secondary/20 px-4 py-3"
          >
            <div className="text-primary">{stat.icon}</div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground opacity-60">
                {stat.label}
              </span>
              <span className="text-xs font-bold text-foreground">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Ledger Component */}
      <div className="group relative">
        <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent" />
        <ProposalList
          proposals={proposals}
          isLoading={isLoading}
          refetch={refetch}
        />
      </div>

      {/* Technical Metadata Footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-10 opacity-40">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold">Governance Protocol V1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] font-bold">
            Blocks Confirmed: 12
          </span>
        </div>
      </div>
    </div>
  )
}

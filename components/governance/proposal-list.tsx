"use client"

import React from "react"
import ProposalCard from "./proposal-card"
import { IProposal } from "@/types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  ChampionIcon,
  Flag01Icon,
  LoadingIcon,
  Sorting05Icon,
} from "@hugeicons/core-free-icons"

interface Props {
  proposals: IProposal[]
  isLoading: boolean
  refetch: () => void
}

export default function ProposalList({ proposals, isLoading, refetch }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-24">
        <div className="relative">
          <HugeiconsIcon
            icon={LoadingIcon}
            className="h-8 w-8 animate-spin text-primary"
          />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase">
          Synchronizing Ledger
        </p>
      </div>
    )
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="h-6 w-6 text-muted-foreground/50"
          />
        </div>
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          No Proposals Found
        </h3>
        <p className="max-w-70 text-xs leading-normal text-muted-foreground">
          The governance queue is empty. New proposals will appear here once
          campaigns are launched.
        </p>
      </div>
    )
  }

  const campaignApprovals = proposals.filter((p) => p.isCampaignApproval)
  const milestoneProposals = proposals.filter((p) => !p.isCampaignApproval)

  return (
    <div className="space-y-12">
      {/* Campaign Approvals Section */}
      {campaignApprovals.length > 0 && (
        <section className="animate-in duration-500 fade-in slide-in-from-bottom-2">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-violet-500/20 bg-violet-500/10">
                <HugeiconsIcon
                  icon={ChampionIcon}
                  className="h-4 w-4 text-violet-500"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase">
                  Campaign Approvals
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  DAO verification for new launches
                </p>
              </div>
            </div>
            <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
              {campaignApprovals.length} Active
            </span>
          </div>

          <div className="grid gap-4">
            {campaignApprovals.map((proposal) => (
              <ProposalCard
                key={proposal.proposalId}
                proposal={proposal}
                refetch={refetch}
              />
            ))}
          </div>
        </section>
      )}

      {/* Milestone Releases Section */}
      {milestoneProposals.length > 0 && (
        <section className="animate-in duration-700 fade-in slide-in-from-bottom-2">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10">
                <HugeiconsIcon
                  icon={Flag01Icon}
                  className="h-4 w-4 text-amber-500"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase">
                  Milestone Releases
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  On-chain fund settlement requests
                </p>
              </div>
            </div>
            <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
              {milestoneProposals.length} Pending
            </span>
          </div>

          <div className="grid gap-4">
            {milestoneProposals.map((proposal) => (
              <ProposalCard
                key={proposal.proposalId}
                proposal={proposal}
                refetch={refetch}
              />
            ))}
          </div>
        </section>
      )}

      {/* Footer Sort Indicator */}
      <div className="flex items-center justify-center gap-2 py-8 opacity-40">
        <HugeiconsIcon
          icon={Sorting05Icon}
          size={12}
          className="text-muted-foreground"
        />
        <span className="text-[9px] font-bold text-muted-foreground uppercase">
          End of Stream
        </span>
      </div>
    </div>
  )
}

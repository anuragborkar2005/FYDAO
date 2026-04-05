"use client"

import * as React from "react"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { IMilestone } from "@/types"
import { useQueue } from "@/hooks/use-queue"
import { useExecute } from "@/hooks/use-execute"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiCloudIcon,
  ArrowRight01Icon,
  Blockchain01Icon,
  LicenseThirdPartyIcon,
  Loading01Icon,
  PlayIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import AiAnalysisBadge from "../ai/ai-analysis-badge"
import { getIpfsUrl } from "@/utils/ipfs"

interface Props {
  milestones: IMilestone[]
  isCreator?: boolean
  refetch?: () => void
}

export default function MilestoneTimeline({
  milestones,
  isCreator,
  refetch,
}: Props) {
  const { queue, isLoading: isQueuing } = useQueue()
  const { execute, isLoading: isExecuting } = useExecute()

  const handleQueue = async (milestone: IMilestone) => {
    if (!milestone.daoProposal) return
    const p = milestone.daoProposal
    try {
      queue({
        proposalId: milestone.proposalId!,
        targets: p.targets,
        values: p.values,
        calldatas: p.calldatas,
        description: p.description,
      })
      if (refetch) refetch()
    } catch (err) {
      console.error("Queue failed", err)
    }
  }

  const handleExecute = async (milestone: IMilestone) => {
    if (!milestone.daoProposal) return
    const p = milestone.daoProposal
    try {
      execute({
        proposalId: milestone.proposalId!,
        targets: p.targets,
        values: p.values,
        calldatas: p.calldatas,
        description: p.description,
      })
      if (refetch) refetch()
    } catch (err) {
      console.error("Execute failed", err)
    }
  }

  return (
    <Card className="relative overflow-hidden border-border bg-card/50">
      <div className="absolute top-0 left-0 h-full w-1 bg-linear-to-b from-primary/40 via-violet-500/20 to-transparent" />

      <CardContent className="p-10">
        <div className="mb-12 flex items-center gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
            <HugeiconsIcon
              icon={Blockchain01Icon}
              className="h-4 w-4 text-primary"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Project Roadmap
            </h2>
            <p className="mt-1 text-sm font-bold text-muted-foreground">
              Milestone Execution & Fund Release
            </p>
          </div>
        </div>

        <div className="relative space-y-12">
          <div className="absolute top-2 bottom-2 left-5.75 w-px bg-border/40" />

          {milestones.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-secondary/20 py-16 text-center">
              <p className="font-medium text-muted-foreground">
                No governance-verified milestones yet.
              </p>
            </div>
          )}

          {milestones.map((milestone, index) => {
            const daoStatus = milestone.daoProposal?.status
            const isSucceeded = daoStatus === "succeeded"
            const isQueued = daoStatus === "queued"
            const isExecuted = daoStatus === "executed"

            const formattedAmount = parseFloat(
              milestone.amount || "0"
            ).toLocaleString()

            return (
              <div
                key={milestone.milestoneId}
                className="group relative flex gap-8"
              >
                {/* Milestone Number Circle */}
                <div
                  className={`h-8 w-8 rounded-md border ${
                    isExecuted
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                      : "border-border bg-secondary text-muted-foreground group-hover:border-primary/50"
                  } z-10 flex shrink-0 items-center justify-center text-lg font-bold transition-all duration-500`}
                >
                  {isExecuted ? (
                    <HugeiconsIcon icon={Tick01Icon} size={18} />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="flex-1 rounded-xl border border-border bg-secondary/30 px-6 py-4 transition-all duration-300 group-hover:bg-secondary/50">
                  <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 text-[9px] font-bold ${
                            isExecuted
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isExecuted
                            ? "Released"
                            : daoStatus || milestone.status}
                        </Badge>
                        <span className="text-sm font-bold text-muted-foreground opacity-50">
                          ID: {milestone.milestoneId}
                        </span>
                      </div>
                      <p className="flex items-baseline gap-2 text-3xl font-bold text-foreground">
                        {formattedAmount}{" "}
                        <span className="text-xs font-bold text-muted-foreground">
                          USDC
                        </span>
                      </p>
                    </div>

                    <div className="flex w-full flex-col items-end gap-3 md:w-auto">
                      {isCreator && isSucceeded && (
                        <Button
                          size="sm"
                          onClick={() => handleQueue(milestone)}
                          disabled={isQueuing}
                          className="h-8 w-full rounded-xl bg-primary px-8 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 md:w-auto"
                        >
                          {isQueuing ? (
                            <HugeiconsIcon
                              icon={Loading01Icon}
                              className="mr-2 h-4 w-4 animate-spin"
                            />
                          ) : (
                            <HugeiconsIcon
                              icon={PlayIcon}
                              className="mr-2 h-4 w-4"
                            />
                          )}
                          Queue Release
                        </Button>
                      )}

                      {isCreator && isQueued && (
                        <Button
                          size="sm"
                          onClick={() => handleExecute(milestone)}
                          disabled={isExecuting}
                          className="h-8 w-full rounded-md bg-indigo-500 px-8 font-bold text-white hover:bg-indigo-600 md:w-auto"
                        >
                          {isExecuting ? (
                            <HugeiconsIcon
                              icon={Loading01Icon}
                              className="mr-2 h-4 w-4 animate-spin"
                            />
                          ) : (
                            <HugeiconsIcon
                              icon={Blockchain01Icon}
                              className="mr-2 h-4 w-4"
                            />
                          )}
                          Execute Release
                        </Button>
                      )}

                      {isExecuted && (
                        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary">
                          <HugeiconsIcon icon={Tick01Icon} size={14} />{" "}
                          Settlement Complete
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis Section */}
                  <div className="rounded-xl border border-border/50 bg-card/50 px-4 py-2">
                    <div className="mb-5 flex items-center gap-2 text-sm font-bold text-primary">
                      <HugeiconsIcon icon={AiCloudIcon} size={14} />
                      Agentic Verification Report
                    </div>
                    <AiAnalysisBadge analysis={milestone.aiAnalysis} />

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span>Proof Reference:</span>
                        <span className="text-foreground opacity-80">
                          {milestone.proofCid.slice(0, 14)}...
                        </span>
                      </div>
                      <Link
                        href={`${getIpfsUrl(milestone.proofCid)}`}
                        target="_blank"
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        View Raw Proof
                      </Link>
                    </div>
                  </div>

                  {milestone.daoProposal && (
                    <Link
                      href={`/governance/${milestone.proposalId}`}
                      className="group/link mt-6 flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-2 transition-all hover:bg-secondary/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <HugeiconsIcon
                            icon={LicenseThirdPartyIcon}
                            className="h-4 w-4 text-primary"
                          />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">
                          DAO Consensus Log
                        </span>
                      </div>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={18}
                        className="transform text-muted-foreground transition-all group-hover/link:translate-x-1 group-hover/link:text-primary"
                      />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

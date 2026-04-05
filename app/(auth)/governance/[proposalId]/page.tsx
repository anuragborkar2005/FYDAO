"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { useProposals } from "@/hooks/use-proposals"
import { useVoteWithDelegation } from "@/hooks/use-vote-with-delegation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Blockchain02Icon,
  Cancel02Icon,
  CircleIcon,
  InformationCircleIcon,
  LoadingIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"

export default function ProposalDetailPage() {
  const router = useRouter()
  const { proposalId } = useParams() as { proposalId: string }

  const { proposals, isLoading: isListLoading } = useProposals()
  const { castVote, isVoting, canVote } = useVoteWithDelegation()

  const proposal = useMemo(() => {
    return proposals.find((p: any) => p.proposalId === proposalId)
  }, [proposals, proposalId])

  const handleVote = async (support: number) => {
    if (!canVote) return
    castVote({ proposalId, support })
  }

  if (isListLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-12">
        <Skeleton className="h-10 w-32 rounded-xl bg-card/50" />
        <Skeleton className="h-96 w-full rounded-3xl bg-card/50" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-40">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="h-12 w-12 text-muted-foreground/20"
        />
        <p className="font-medium text-muted-foreground">
          Proposal not found in governance records.
        </p>
        <Button variant="link" onClick={() => router.push("/governance")}>
          Return to Ledger
        </Button>
      </div>
    )
  }

  const isActive = proposal.status === "Active"

  return (
    <div className="mx-auto max-w-7xl animate-in space-y-8 px-8 py-4 duration-700 fade-in">
      {/* Breadcrumb */}
      <Link
        href="/governance"
        className="group flex w-fit items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
      >
        <div className="rounded-md border border-border bg-secondary/30 p-2 transition-all group-hover:border-primary/30">
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            size={18}
            className="transition-transform group-hover:-translate-x-0.5"
          />
        </div>
        <span className="text-sm font-bold">Back to Governance</span>
      </Link>

      <Card className="relative overflow-hidden rounded-xl border-border bg-card/50">
        <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />

        <CardHeader className="px-6 py-2 pb-6">
          <div className="mb-6 flex items-center justify-between">
            <Badge
              variant="outline"
              className="rounded-md border-primary/20 bg-primary/5 px-4 py-1 text-xs font-bold text-primary"
            >
              {proposal.status}
            </Badge>
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground/40">
              <HugeiconsIcon icon={Blockchain02Icon} size={14} />
              ID: {proposalId}
            </div>
          </div>
          <CardTitle className="text-2xl leading-tight font-bold text-foreground">
            {proposal.description}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-12 px-6 py-2 pt-0">
          {/* Progress / Info Section */}
          <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <HugeiconsIcon icon={InformationCircleIcon} size={14} />
              Proposal Specification
            </div>
            <p className="leading-relaxed font-medium text-muted-foreground">
              This governance action was initiated to synchronize the on-chain
              state with the FYDAO campaign registry. If succeeded, the protocol
              will automatically transition to the next lifecycle stage.
            </p>
          </div>

          {/* Voting Action Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                Cast Consensus
              </h3>
              {!canVote && (
                <span className="animate-pulse text-sm font-bold text-destructive">
                  Delegation Required
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Button
                onClick={() => handleVote(1)}
                disabled={isVoting || !isActive || !canVote}
                className="rounded-md border border-primary/20 bg-primary/10 font-bold text-primary transition-all hover:bg-primary/20"
              >
                {isVoting ? (
                  <HugeiconsIcon icon={LoadingIcon} className="animate-spin" />
                ) : (
                  <HugeiconsIcon icon={Tick01Icon} className="mr-2" />
                )}
                Vote For
              </Button>

              <Button
                onClick={() => handleVote(0)}
                disabled={isVoting || !isActive || !canVote}
                variant="outline"
                className="rounded-md border-destructive/20 font-bold text-destructive hover:bg-destructive/5"
              >
                <HugeiconsIcon icon={Cancel02Icon} className="mr-2" />
                Against
              </Button>

              <Button
                onClick={() => handleVote(2)}
                disabled={isVoting || !isActive || !canVote}
                variant="ghost"
                className="rounded-md border border-border font-bold text-muted-foreground hover:bg-secondary/50"
              >
                <HugeiconsIcon icon={CircleIcon} className="mr-2" />
                Abstain
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

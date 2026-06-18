"use client"

import { useState } from "react"
import Link from "next/link"
import { formatUnits } from "viem"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useQueue } from "@/hooks/use-queue"
import { useExecute } from "@/hooks/use-execute"
import { TOKEN_DECIMALS } from "@/contracts/config"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  LoadingIcon,
  PlayIcon,
  Tick01Icon,
  ZapIcon,
  Link01Icon,
  FileAttachmentIcon,
} from "@hugeicons/core-free-icons"
import VoteModal from "./vote-modal"
import { getIpfsUrl } from "@/utils/ipfs"

export default function ProposalCard({
  proposal,
  refetch,
}: {
  proposal: any
  refetch: () => void
}) {
  const [showVoteModal, setShowVoteModal] = useState(false)

  const { queue, isLoading: isQueuing } = useQueue()
  const { execute, isLoading: isExecuting } = useExecute()

  const isActive = proposal.status === "active"
  const isSucceeded = proposal.status === "succeeded"
  const isQueued = proposal.status === "queued"
  const isExecuted = proposal.status === "executed"

  const proofCid = proposal.proofCid
  const truncatedCid = proofCid
    ? `${proofCid.slice(0, 4)}...${proofCid.slice(-4)}`
    : null
  const ipfsGateway = getIpfsUrl(proofCid)

  const vFor = BigInt(proposal.votesFor || 0)
  const vAgainst = BigInt(proposal.votesAgainst || 0)
  const totalVotes = vFor + vAgainst

  const formattedVotesFor = Number(
    formatUnits(vFor, TOKEN_DECIMALS.GovernanceToken)
  ).toLocaleString()
  const formattedVotesAgainst = Number(
    formatUnits(vAgainst, TOKEN_DECIMALS.GovernanceToken)
  ).toLocaleString()

  const forPercent = totalVotes > 0n ? Number((vFor * 100n) / totalVotes) : 0
  const againstPercent =
    totalVotes > 0n ? Number((vAgainst * 100n) / totalVotes) : 0

  const handleQueue = async () => {
    try {
      queue({
        proposalId: proposal.proposalId,
        targets: proposal.targets,
        values: proposal.values,
        calldatas: proposal.calldatas,
        description: proposal.description,
      })
      refetch()
    } catch (error) {
      console.error("Queue failed", error)
    }
  }

  const handleExecute = async () => {
    try {
      execute({
        proposalId: proposal.proposalId,
        targets: proposal.targets,
        values: proposal.values,
        calldatas: proposal.calldatas,
        description: proposal.description,
      })
      refetch()
    } catch (error) {
      console.error("Execute failed", error)
    }
  }

  const getStatusStyles = () => {
    switch (proposal.status) {
      case "active":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20"
      case "succeeded":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      case "executed":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case "defeated":
        return "text-destructive bg-destructive/10 border-destructive/20"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-card p-4 transition-all hover:border-primary/30">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        {/* Main Info Area */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`${getStatusStyles()} h-5 rounded-sm px-1.5 text-[10px] font-bold tracking-wider uppercase`}
            >
              {proposal.status}
            </Badge>

            {/* Redirection Link to Proof */}
            {proofCid && (
              <Link
                href={ipfsGateway}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-sm border border-border bg-secondary/50 px-2 py-0.5 text-[10px] font-bold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <HugeiconsIcon icon={FileAttachmentIcon} size={10} />
                {proposal.isCampaignApproval
                  ? "CAMPAIGN METADATA"
                  : "MILESTONE PROOF"}
                : {truncatedCid}
                <HugeiconsIcon
                  icon={Link01Icon}
                  size={8}
                  className="opacity-50"
                />
              </Link>
            )}

            <span className="font-mono text-[10px] text-muted-foreground/40">
              ID: {proposal.proposalId.slice(0, 8)}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-foreground">
            {proposal.description}
          </h3>

          {/* Voting Metrics */}
          <div className="grid max-w-sm grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-primary">For</span>
                <span className="text-muted-foreground">
                  {formattedVotesFor}
                </span>
              </div>
              <Progress value={forPercent} className="h-1 rounded-none" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-destructive">Against</span>
                <span className="text-muted-foreground">
                  {formattedVotesAgainst}
                </span>
              </div>
              <Progress value={againstPercent} className="h-1 rounded-none" />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex min-w-35 flex-col gap-2">
          {isActive && (
            <Button
              size="sm"
              onClick={() => setShowVoteModal(true)}
              className="h-9 w-full rounded-lg text-[12px] font-bold uppercase"
            >
              <HugeiconsIcon icon={ZapIcon} size={14} className="mr-2" />
              Cast Vote
            </Button>
          )}

          {isSucceeded && (
            <Button
              size="sm"
              onClick={handleQueue}
              disabled={isQueuing}
              className="h-9 w-full rounded-lg text-[12px] font-bold uppercase"
            >
              {isQueuing ? (
                <HugeiconsIcon
                  icon={LoadingIcon}
                  size={14}
                  className="mr-2 animate-spin"
                />
              ) : (
                <HugeiconsIcon icon={PlayIcon} size={14} className="mr-2" />
              )}
              Queue
            </Button>
          )}

          {isQueued && (
            <Button
              size="sm"
              onClick={handleExecute}
              disabled={isExecuting}
              className="h-9 w-full rounded-lg bg-blue-600 text-[12px] font-bold text-white uppercase hover:bg-blue-700"
            >
              {isExecuting ? (
                <HugeiconsIcon
                  icon={LoadingIcon}
                  size={14}
                  className="mr-2 animate-spin"
                />
              ) : (
                <HugeiconsIcon icon={Tick01Icon} size={14} className="mr-2" />
              )}
              Execute
            </Button>
          )}

          {isExecuted && (
            <div className="flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-[11px] font-bold text-emerald-600 uppercase">
              <HugeiconsIcon icon={Tick01Icon} size={14} /> Finalized
            </div>
          )}

          <Link
            href={`/governance/${proposal.proposalId}`}
            className="flex items-center justify-center gap-1 text-[11px] font-bold text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            Metrics <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
          </Link>
        </div>
      </div>

      <VoteModal
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        proposalId={proposal.proposalId}
        description={proposal.description}
        onVoteSuccess={refetch}
      />
    </div>
  )
}

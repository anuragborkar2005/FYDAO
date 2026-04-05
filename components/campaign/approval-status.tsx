"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertTriangle,
  Cancel01Icon,
  Clock01Icon,
  Loading01Icon,
  PlayIcon,
  ReloadIcon,
  SquareLock02Icon,
  Tick01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { useProposeApproval } from "@/hooks/use-proposal-approval"
import { useProposal } from "@/hooks/use-proposal"
import { useQueue } from "@/hooks/use-queue"
import { useExecute } from "@/hooks/use-execute"

interface Campaign {
  onChainAddress: string
  creator: string
  status: "created" | "pending_approval" | "live" | "rejected" | "completed"
  isLive: boolean
  approvalProposalId?: string
  raisedAmount?: string
  targetAmount?: string
  metadata?: {
    title: string
  }
}

interface Props {
  campaign: Campaign
  onRefresh?: () => void
}

export default function ApprovalStatus({ campaign, onRefresh }: Props) {
  const { address } = useAccount()
  const [timeLeft, setTimeLeft] = useState<string>("")
  const isCreator = address?.toLowerCase() === campaign.creator.toLowerCase()

  const raised = parseFloat(campaign.raisedAmount || "0")
  const target = parseFloat(campaign.targetAmount || "0")
  const isEnded = raised >= target && target > 0

  const { proposeApproval, isLoading: isProposing } = useProposeApproval(
    campaign.onChainAddress as `0x${string}`
  )

  const {
    proposal,
    isLoading: isProposalLoading,
    syncState,
    refetch: refetchProposal,
  } = useProposal(campaign.approvalProposalId)

  const { queue, isLoading: isQueuing, isSuccess: isQueueSuccess } = useQueue()
  const {
    execute,
    isLoading: isExecuting,
    isSuccess: isExecuteSuccess,
  } = useExecute()

  useEffect(() => {
    if (isQueueSuccess || isExecuteSuccess) {
      syncState().then(() => {
        if (onRefresh) onRefresh()
      })
    }
  }, [isQueueSuccess, isExecuteSuccess, syncState, onRefresh])

  useEffect(() => {
    if (campaign.status === "pending_approval" && campaign.approvalProposalId) {
      const mockDeadline = Date.now() + 7 * 24 * 60 * 60 * 1000
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.floor((mockDeadline - Date.now()) / 1000)
        )
        const days = Math.floor(remaining / 86400)
        const hours = Math.floor((remaining % 86400) / 3600)
        setTimeLeft(`${days}d ${hours}h left`)
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [campaign.status, campaign.approvalProposalId])

  const getStatusDisplay = () => {
    // If we have real-time proposal status, use it to override displayed info
    const effectiveStatus = proposal?.status || campaign.status

    if (isEnded) {
      return {
        icon: (
          <HugeiconsIcon
            icon={Tick01Icon}
            className="h-6 w-6 text-emerald-400"
          />
        ),
        label: "Campaign Ended",
        theme: "emerald",
        styles: "bg-emerald-400/5 text-emerald-400 border-emerald-400/20",
        description:
          "This campaign has reached its funding goal. Thank you to all contributors!",
      }
    }

    switch (effectiveStatus) {
      case "executed":
      case "live":
        return {
          icon: (
            <HugeiconsIcon icon={Tick01Icon} className="h-6 w-6 text-primary" />
          ),
          label: "Active & Funding",
          theme: "primary",
          styles: "bg-primary/5 text-primary border-primary/20",
          description:
            "This campaign is verified and currently accepting USDC donations.",
        }
      case "succeeded":
        return {
          icon: (
            <HugeiconsIcon
              icon={Tick01Icon}
              className="h-6 w-6 text-emerald-400"
            />
          ),
          label: "Proposal Succeeded",
          theme: "emerald",
          styles: "bg-emerald-400/5 text-emerald-400 border-emerald-400/20",
          description:
            "Voting ended successfully. Ready to be queued for execution.",
        }
      case "queued":
        return {
          icon: (
            <HugeiconsIcon
              icon={Clock01Icon}
              className="h-6 w-6 text-indigo-400"
            />
          ),
          label: "Queued in Timelock",
          theme: "indigo",
          styles: "bg-indigo-400/5 text-indigo-400 border-indigo-400/20",
          description:
            "Proposal is in the timelock period. Will be ready to execute soon.",
        }
      case "pending":
      case "active":
      case "pending_approval":
        return {
          icon: (
            <HugeiconsIcon
              icon={Clock01Icon}
              className="h-6 w-6 text-amber-400"
            />
          ),
          label: "Governance Review",
          theme: "amber",
          styles: "bg-amber-400/5 text-amber-400 border-amber-400/20",
          description:
            "Currently in the voting period. 4% Quorum required for approval.",
        }
      case "defeated":
      case "rejected":
        return {
          icon: (
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="h-6 w-6 text-red-400"
            />
          ),
          label: "DAO Rejected",
          theme: "red",
          styles: "bg-red-400/5 text-red-400 border-red-400/20",
          description:
            "The proposal failed to meet quorum or was voted down by the DAO.",
        }
      case "completed":
        return {
          icon: (
            <HugeiconsIcon icon={Tick01Icon} className="h-6 w-6 text-primary" />
          ),
          label: "Fully Funded",
          theme: "primary",
          styles: "bg-primary/5 text-primary border-primary/20",
          description:
            "All milestones have been successfully executed and released.",
        }
      default:
        return {
          icon: (
            <HugeiconsIcon
              icon={AlertTriangle}
              className="h-6 w-6 text-muted-foreground"
            />
          ),
          label: "Draft Submission",
          theme: "muted",
          styles: "bg-muted/10 text-muted-foreground border-border",
          description:
            "On-chain record created. Submit to FYDAO to begin verification.",
        }
    }
  }

  const status = getStatusDisplay()

  const handleQueue = async () => {
    if (!proposal) return
    queue({
      proposalId: proposal.proposalId,
      targets: proposal.targets,
      values: proposal.values,
      calldatas: proposal.calldatas,
      description: proposal.description,
    })
  }

  const handleExecute = async () => {
    if (!proposal) return
    execute({
      proposalId: proposal.proposalId,
      targets: proposal.targets,
      values: proposal.values,
      calldatas: proposal.calldatas,
      description: proposal.description,
    })
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 backdrop-blur-md transition-all duration-500 ${status.styles}`}
    >
      <div
        className={`absolute top-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-current to-transparent font-black opacity-40`}
      />

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="flex items-start gap-5">
          <div className="rounded-lg border border-current/10 bg-background/40 p-1.5 shadow-inner">
            {status.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold">{status.label}</h3>
            <p className="max-w-xs text-sm leading-relaxed font-medium opacity-70">
              {status.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {campaign.status === "pending_approval" && timeLeft && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-400">
              <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
              {timeLeft}
            </div>
          )}
          {campaign.approvalProposalId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refetchProposal()
                syncState()
              }}
              className="h-8 text-xs font-bold opacity-60 hover:opacity-100"
            >
              <HugeiconsIcon
                icon={ReloadIcon}
                className={`mr-2 h-3 w-3 ${isProposalLoading ? "animate-spin" : ""}`}
              />
              REFRESH ON-CHAIN
            </Button>
          )}
        </div>
      </div>

      {/* Action Zone */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        {isCreator && campaign.status === "created" && (
          <Button
            onClick={() => proposeApproval()}
            disabled={isProposing}
            className="h-8 flex-1 rounded-lg bg-primary font-bold text-primary-foreground transition-all hover:opacity-90"
          >
            {isProposing ? (
              <HugeiconsIcon
                icon={Loading01Icon}
                className="mr-2 h-5 w-5 animate-spin"
              />
            ) : (
              <HugeiconsIcon icon={SquareLock02Icon} className="mr-2 h-5 w-5" />
            )}
            Initialize DAO Approval
          </Button>
        )}

        {(proposal?.status === "pending" || proposal?.status === "active") && (
          <Button
            variant="outline"
            className="h-10 flex-1 rounded-xl border-amber-400/30 bg-amber-400/5 font-bold text-amber-400 transition-all hover:bg-amber-400/10"
            onClick={() =>
              window.open(
                `/governance/${campaign.approvalProposalId}`,
                "_blank"
              )
            }
          >
            <HugeiconsIcon icon={UserGroupIcon} className="mr-2 h-5 w-5" />
            Cast Governance Vote
          </Button>
        )}

        {proposal?.status === "succeeded" && (
          <Button
            onClick={handleQueue}
            disabled={isQueuing}
            className="h-10 flex-1 rounded-xl bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-90"
          >
            {isQueuing ? (
              <HugeiconsIcon
                icon={Loading01Icon}
                className="mr-2 h-5 w-5 animate-spin"
              />
            ) : (
              <HugeiconsIcon icon={PlayIcon} className="mr-2 h-5 w-5" />
            )}
            Queue for Execution
          </Button>
        )}

        {proposal?.status === "queued" && (
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="h-10 flex-1 rounded-xl bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:opacity-90"
          >
            {isExecuting ? (
              <HugeiconsIcon
                icon={Loading01Icon}
                className="mr-2 h-5 w-5 animate-spin"
              />
            ) : (
              <HugeiconsIcon icon={Tick01Icon} className="mr-2 h-5 w-5" />
            )}
            Finalize & Go Live
          </Button>
        )}
      </div>

      {campaign.status === "pending_approval" && (
        <div className="mt-8 border-t border-amber-400/10 pt-8">
          <div className="mb-3 flex items-center justify-between text-sm font-bold opacity-60">
            <span>Voting Progress</span>
            <span>Real-time Status: {proposal?.status || "Loading..."}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full border border-amber-400/5 bg-background/50">
            <div
              className={`h-full transition-all duration-1000 ${
                proposal?.status === "succeeded" ||
                proposal?.status === "queued" ||
                proposal?.status === "executed"
                  ? "w-full bg-emerald-400"
                  : "w-[35%] bg-amber-400"
              }`}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-sm opacity-50">
              PRP_ID: {campaign.approvalProposalId?.slice(0, 12)}...
            </span>
            <div className="flex gap-2">
              <div
                className={`h-2 w-2 animate-pulse rounded-full ${
                  proposal?.status === "defeated"
                    ? "bg-red-500"
                    : proposal?.status === "executed"
                      ? "bg-primary"
                      : "bg-emerald-500"
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  proposal?.status === "defeated"
                    ? "text-red-500"
                    : proposal?.status === "executed"
                      ? "text-primary"
                      : "text-emerald-500"
                }`}
              >
                {proposal?.status || "Active On-Chain"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

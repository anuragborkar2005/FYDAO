"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVoteWithDelegation } from "@/hooks/use-vote-with-delegation"
import {
  Cancel01Icon,
  Cancel02Icon,
  LeftToRightListDashIcon,
  LoadingIcon,
  ShieldIcon,
  Tick01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface Props {
  isOpen: boolean
  onClose: () => void
  proposalId: string
  description: string
  onVoteSuccess: () => void
}

export default function VoteModal({
  isOpen,
  onClose,
  proposalId,
  description,
  onVoteSuccess,
}: Props) {
  const [support, setSupport] = useState<0 | 1 | 2>(1)
  const { castVote, delegate, isVoting, canVote, isDelegating, isVoteSuccess } =
    useVoteWithDelegation()

  useEffect(() => {
    if (isVoteSuccess) {
      onVoteSuccess()
      onClose()
    }
  }, [isVoteSuccess, onVoteSuccess, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/60 p-4 duration-300 fade-in">
      <div className="group relative w-full max-w-md">
        {/* Glow effect matching primary theme */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-primary/20 to-transparent opacity-40 blur" />

        <div className="relative overflow-hidden rounded-3xl border-border bg-card/95 p-8 shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2">
              <HugeiconsIcon
                icon={ZapIcon}
                className="text-primary"
                size={20}
              />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Cast Your Vote
            </h3>
          </div>

          <div className="mb-8 rounded-2xl border border-border/50 bg-secondary/30 p-4">
            <p className="line-clamp-3 text-sm leading-relaxed font-medium text-muted-foreground italic">
              &quot;{description}&quot;
            </p>
          </div>

          {!canVote && (
            <Alert className="mb-8 animate-in rounded-2xl border-primary/30 bg-primary/5 slide-in-from-top-2">
              <AlertDescription className="flex flex-col items-start gap-2 text-xs leading-relaxed font-bold text-primary/90">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={ShieldIcon} size={16} />
                  <span>VOTING POWER INACTIVE</span>
                </div>
                <p className="font-medium normal-case opacity-80">
                  You must self-delegate your tokens to initialize your voting
                  weight in the Governor contract.
                </p>
                <Button
                  variant="link"
                  onClick={() => delegate(undefined)}
                  disabled={isDelegating}
                  className="h-auto p-0 text-sm font-bold text-primary hover:no-underline hover:opacity-70"
                >
                  {isDelegating ? (
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={LoadingIcon}
                        className="animate-spin"
                        size={14}
                      />
                      <span>Syncing...</span>
                    </div>
                  ) : (
                    "Initialize Power Now →"
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => setSupport(1)}
              disabled={!canVote}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-6 transition-all duration-300 ${
                support === 1
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                  : "hover:border-border-hover border-border bg-secondary/20 text-muted-foreground"
              } ${!canVote && "cursor-not-allowed opacity-40"}`}
            >
              <HugeiconsIcon icon={Tick01Icon} size={24} />
              <span className="text-sm font-bold">For</span>
            </button>

            <button
              onClick={() => setSupport(0)}
              disabled={!canVote}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-6 transition-all duration-300 ${
                support === 0
                  ? "border-destructive bg-destructive/10 text-destructive shadow-[0_0_15px_rgba(var(--destructive),0.2)]"
                  : "hover:border-border-hover border-border bg-secondary/20 text-muted-foreground"
              } ${!canVote && "cursor-not-allowed opacity-40"}`}
            >
              <HugeiconsIcon icon={Cancel02Icon} size={24} />
              <span className="text-xs font-bold">Against</span>
            </button>
          </div>

          <Button
            onClick={() => castVote({ proposalId, support })}
            disabled={isVoting || !canVote}
            className="h-16 w-full rounded-2xl bg-foreground text-lg font-bold text-background shadow-xl transition-all hover:opacity-90 active:scale-[0.98]"
          >
            {isVoting ? (
              <div className="flex items-center gap-3">
                <HugeiconsIcon
                  icon={LoadingIcon}
                  className="animate-spin"
                  size={20}
                />
                <span>Broadcasting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={LeftToRightListDashIcon} size={20} />
                <span>Confirm Proposal Vote</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

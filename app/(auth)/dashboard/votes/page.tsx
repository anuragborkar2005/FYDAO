"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Award01Icon,
  Cancel02Icon,
  InformationCircleIcon,
  LeftToRightListDashIcon,
  LoadingIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"

export default function MyVotesPage() {
  const { address } = useAccount()

  // Assuming you'll have an endpoint to fetch user-specific votes
  const { data: votes = [], isLoading } = useQuery({
    queryKey: ["my-votes", address],
    queryFn: async () => {
      const res = await fetch(`/api/governance/my-votes?address=${address}`)
      const data = await res.json()
      return data.votes || []
    },
    enabled: !!address,
  })

  return (
    <div className="animate-in space-y-10 duration-700 fade-in slide-in-from-bottom-2">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-primary/20 bg-primary/10 p-2.5">
            <HugeiconsIcon
              icon={Award01Icon}
              className="h-4 w-4 text-primary"
            />
          </div>
          <h1 className="text-xl font-bold text-foreground">Voting History</h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground">
          A personal audit trail of your contributions to the DAO&apos;s
          consensus and fund release decisions.
        </p>
      </div>

      {/* History Card */}
      <Card className="overflow-hidden rounded-3xl border-border bg-card/50">
        <CardHeader className="border-b border-border/50 bg-secondary/10 px-4 py-1.5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <HugeiconsIcon
                icon={LeftToRightListDashIcon}
                size={14}
                className="text-primary"
              />
              Consensus Record
            </CardTitle>
            {votes.length > 0 && (
              <Badge
                variant="secondary"
                className="rounded-lg text-sm font-bold"
              >
                {votes.length} PARTICIPATIONS
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-24">
              <HugeiconsIcon
                icon={LoadingIcon}
                className="h-8 w-8 animate-spin text-primary"
              />
              <p className="text-sm font-bold text-muted-foreground">
                Querying Ledger...
              </p>
            </div>
          ) : votes.length > 0 ? (
            <div className="divide-y divide-border/50">
              {votes.map((vote: any, i: number) => (
                <div
                  key={i}
                  className="group flex items-center justify-between p-6 transition-colors hover:bg-primary/5"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                      {vote.proposalDescription}
                    </span>
                    <span className="text-sm text-muted-foreground opacity-50">
                      ID: {vote.txHash?.slice(0, 14)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end text-right">
                      <span
                        className={`text-sm font-bold ${vote.support === 1 ? "text-primary" : "text-destructive"}`}
                      >
                        {vote.support === 1 ? "Voted For" : "Voted Against"}
                      </span>
                      <span className="text-sm font-bold text-muted-foreground/60">
                        {vote.weight} vGTK Weight
                      </span>
                    </div>
                    <div
                      className={`rounded-lg border p-2 ${vote.support === 1 ? "border-primary/20 bg-primary/10 text-primary" : "border-destructive/20 bg-destructive/10 text-destructive"}`}
                    >
                      {vote.support === 1 ? (
                        <HugeiconsIcon icon={Tick01Icon} size={16} />
                      ) : (
                        <HugeiconsIcon icon={Cancel02Icon} size={16} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center space-y-4 px-8 py-24 text-center">
              <div className="rounded-2xl border border-border bg-secondary/50 p-4 shadow-inner">
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  className="h-10 w-10 text-muted-foreground opacity-30"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">
                  No Votes Logged
                </h4>
                <p className="mx-auto max-w-60 text-xs leading-relaxed text-muted-foreground">
                  Participate in active governance proposals to build your
                  reputation score within the DAO.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Footer */}
      <div className="flex items-center justify-between px-2 opacity-30">
        <span className="uppercas text-[9px] font-bold">
          Signature Verification: Active
        </span>
      </div>
    </div>
  )
}

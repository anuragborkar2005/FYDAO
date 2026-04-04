"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatUnits } from "viem"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  FolderCodeIcon,
  Target02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

export default function CampaignCard({ campaign }: { campaign: any }) {
  const isLive = campaign.isLive || campaign.status === "live"

  const raised = Number(formatUnits(BigInt(campaign.raisedAmount || 0), 6))
  const target = Number(formatUnits(BigInt(campaign.targetAmount || 0), 6))
  const percent = Math.min(Math.round((raised / target) * 100), 100) || 0

  return (
    <Link href={`/campaigns/${campaign.onChainAddress}`}>
      <div className="group relative h-full">
        <div className="absolute -inset-0.5 rounded-xl bg-linear-to-r from-primary/50 to-violet-500/30 opacity-0 blur transition duration-500 group-hover:opacity-20" />

        <Card className="glass relative flex h-full flex-col overflow-hidden border-border bg-card/40 backdrop-blur-md transition-all duration-500 hover:bg-card/60">
          <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-primary to-transparent opacity-30 transition-opacity group-hover:opacity-100" />

          <CardContent className="flex h-full flex-col p-8">
            <div className="mb-6 flex items-start justify-between">
              <Badge
                variant="outline"
                className={`${
                  isLive
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                } rounded-md px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase`}
              >
                {campaign.status}
              </Badge>
              <div className="rounded-xl border border-border bg-secondary p-2 text-muted-foreground transition-all duration-300 group-hover:border-primary/30 group-hover:text-primary">
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </div>
            </div>

            <h3 className="line-clamp-2 text-xl leading-tight font-bold text-foreground transition-colors group-hover:text-primary">
              {campaign.metadata?.title || "Untitled Campaign"}
            </h3>

            <p className="mt-4 line-clamp-3 grow text-sm leading-relaxed font-medium text-muted-foreground opacity-80">
              {campaign.metadata?.description}
            </p>

            <div className="mt-8 border-t border-border pt-6">
              <div className="mb-3 flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    <HugeiconsIcon
                      icon={Target02Icon}
                      size={12}
                      className="text-primary"
                    />{" "}
                    Funding
                  </span>
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    {percent}%
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-foreground">
                    {raised.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                    Goal: {target.toLocaleString()} USDC
                  </span>
                </div>
              </div>

              {/* Progress Bar using Theme Colors */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={UserGroupIcon}
                      size={14}
                      className="text-muted-foreground"
                    />
                    <span className="text-[10px] font-bold text-foreground">
                      {campaign.milestones?.length || 0}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      Milestones
                    </span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={FolderCodeIcon}
                      size={14}
                      className="text-muted-foreground"
                    />
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      {campaign.metadata?.category || "General"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  )
}

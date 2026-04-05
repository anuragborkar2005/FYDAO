"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CampaignCard from "@/components/campaign/campaign-card"

import { ICampaign } from "@/types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartLine,
  FolderSearchIcon,
  PackageIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

export default function MyCampaignsPage() {
  const { address } = useAccount()

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns", "my", address],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/my?address=${address}`)
      const data = await res.json()
      return data.campaigns || []
    },
    enabled: !!address,
  })

  return (
    <div className="animate-in space-y-10 duration-700 fade-in slide-in-from-bottom-2">
      {/* Header with Stats Summary */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-primary/20 bg-primary/10 p-2.5">
              <HugeiconsIcon
                icon={ChartLine}
                className="h-4 w-4 text-primary"
              />
            </div>
            <h1 className="text-xl font-bold text-foreground">My Portfolio</h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground">
            Monitor the lifecycle, funding progress, and milestone releases for
            all initiatives you&apos;ve deployed.
          </p>
        </div>

        <Link href="/campaigns/create">
          <Button
            size="lg"
            className="rounded-md bg-primary px-6 py-4 font-bold text-primary-foreground transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="mr-3 h-5 w-5" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Main Grid Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-100 animate-pulse rounded-3xl border border-border/50 bg-card/50"
            />
          ))}
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {campaigns.map((campaign: ICampaign) => (
            <CampaignCard key={campaign.onChainAddress} campaign={campaign} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="rounded-3xl border-dashed border-border bg-card/50 py-24 text-center">
          <CardContent className="space-y-6">
            <div className="mx-auto w-fit rounded-2xl border border-border bg-secondary/50 p-6">
              <HugeiconsIcon
                icon={PackageIcon}
                className="h-12 w-12 text-muted-foreground opacity-40"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                No Active Initiatives
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed font-medium text-muted-foreground">
                You haven&apos;t deployed any campaigns to the FYDAO protocol
                yet. Start a new project to see it here.
              </p>
            </div>
            <Link href="/campaigns/create" className="block">
              <Button
                variant="outline"
                className="rounded-xl border-primary/30 px-8 font-bold text-primary hover:bg-primary/5"
              >
                Deploy First Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between border-t border-border/40 pt-10 opacity-40">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FolderSearchIcon} size={14} />
          <span className="text-sm font-bold">Platform Status: Active</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useQuery } from "@tanstack/react-query"
import CampaignCard from "@/components/campaign/campaign-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useAccount } from "wagmi"

import { ICampaign } from "@/types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AddTeamIcon,
  FolderSearchIcon,
  GlobalIcon,
  LoadingIcon,
  PlusSignIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CampaignsPage() {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<"all" | "my">("all")

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns", activeTab, address],
    queryFn: async () => {
      const endpoint =
        activeTab === "all"
          ? "/api/campaigns"
          : `/api/campaigns/my?address=${address}`
      const res = await fetch(endpoint)
      const data = await res.json()
      return data.campaigns || []
    },
    refetchInterval: 20000,
    enabled: activeTab === "all" || !!address,
  })

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-primary/20 bg-primary/10 p-2.5">
              <HugeiconsIcon
                icon={FolderSearchIcon}
                className="h-6 w-6 text-primary"
              />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Campaigns</h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground">
            {activeTab === "all"
              ? "Explore decentralized initiatives and support verified projects through the FYDAO protocol."
              : "Monitor and manage the decentralized campaigns you have deployed to the network."}
          </p>
        </div>

        <Link href="/campaigns/create">
          <Button
            size="lg"
            className="h-8 rounded-md bg-primary px-4 tracking-wide text-primary-foreground transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="mr-3 h-5 w-5" />
            Initiate Campaign
          </Button>
        </Link>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "all" | "my")}
        className="w-fit p-1"
      >
        <TabsList className="gap-1 rounded-md border border-border bg-secondary/50 p-1">
          <TabsTrigger
            value="all"
            className="flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <HugeiconsIcon icon={GlobalIcon} size={16} />
            Discover
          </TabsTrigger>
          <TabsTrigger
            value="my"
            className="flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <HugeiconsIcon icon={UserCircleIcon} size={16} />
            Portfolio
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-100 animate-pulse rounded-2xl border border-border/50 bg-card/50"
            />
          ))}
        </div>
      ) : (
        <>
          {campaigns.length > 0 ? (
            <div className="grid animate-in grid-cols-1 gap-8 duration-700 fade-in slide-in-from-bottom-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign: ICampaign) => (
                <CampaignCard
                  key={campaign.onChainAddress}
                  campaign={campaign}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="group relative overflow-hidden rounded-3xl border border-dashed border-border bg-card/50 py-32 text-center transition-all duration-500">
              <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10 space-y-6">
                <div className="mx-auto w-fit rounded-[2rem] border border-border bg-secondary/50 p-5 shadow-inner">
                  <HugeiconsIcon
                    icon={AddTeamIcon}
                    className="h-12 w-12 text-muted-foreground opacity-40"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    Empty Registry
                  </h3>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed font-medium text-muted-foreground">
                    {activeTab === "all"
                      ? "No decentralized campaigns are currently active on the protocol."
                      : "You haven't deployed any initiatives to the FYDAO ledger yet."}
                  </p>
                </div>

                {activeTab === "my" && (
                  <Link href="/campaigns/create">
                    <Button
                      variant="outline"
                      className="rounded-xl border-primary/30 px-8 font-bold text-primary hover:bg-primary/5"
                    >
                      Deploy Your First Campaign
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Background Branding Watermark */}
      <div className="pointer-events-none fixed right-10 bottom-10 -z-10 opacity-[0.03] select-none">
        <HugeiconsIcon
          icon={LoadingIcon}
          className="animate-spin-slow h-96 w-96 text-primary"
        />
      </div>
    </div>
  )
}

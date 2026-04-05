"use client"

import { useAccount } from "wagmi"
import { useCampaign } from "@/hooks/use-campaign"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import MilestoneProposalSection from "./milestone-proposal-section"
import ApprovalStatus from "./approval-status"
import MilestoneTimeline from "./milestone-timeline"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlignLeftIcon,
  Blockchain02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import DonateSection from "./donation-section"
import EscrowProgressBar from "../escrow/escrow-progress-bar"

interface Props {
  campaignAddress: `0x${string}`
}

export default function CampaignDetail({ campaignAddress }: Props) {
  const { address } = useAccount()
  const { data: campaign, isLoading, refetch } = useCampaign(campaignAddress)

  const isCreator =
    !!address &&
    !!campaign?.creator &&
    address.toLowerCase() === campaign.creator.toLowerCase()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12">
        <Skeleton className="h-40 w-full rounded-3xl bg-card/50" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <Skeleton className="h-96 w-full rounded-3xl bg-card/50" />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-64 w-full rounded-3xl bg-card/50" />
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-40">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="h-12 w-12 text-muted-foreground opacity-20"
        />
        <p className="text-lg font-medium text-muted-foreground">
          Campaign data not found on-chain.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <ApprovalStatus campaign={campaign} />
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        {/* 2. Main Content (Left Column) */}
        <div className="space-y-10 lg:col-span-8">
          {/* Campaign Story Card */}
          <Card className="relative overflow-hidden rounded-3xl border-border bg-card/50">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-primary/50 to-transparent" />

            <CardHeader className="px-8 pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={AlignLeftIcon}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm font-bold text-muted-foreground">
                    Campaign Details
                  </span>
                </div>
                {campaign.aiReview && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">
                      AI Verified: {campaign.aiReview.confidence}%
                    </span>
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl font-bold tracking-tighter text-foreground leading-tight">
                {campaign.metadata?.title || "Unnamed Initiative"}
              </CardTitle>
            </CardHeader>

            <CardContent className="prose prose-invert max-w-none p-10 pt-0">
              <div className="mb-8 h-px w-full bg-border/50" />
              <p className="text-sm leading-relaxed font-medium text-muted-foreground opacity-90">
                {campaign.metadata?.description}
              </p>

              {campaign.aiReview && (
                <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <HugeiconsIcon
                      icon={InformationCircleIcon}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="text-sm font-bold text-primary">
                      AI Trust Analysis
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    {campaign.aiReview.summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <HugeiconsIcon
                icon={Blockchain02Icon}
                className="h-5 w-5 text-primary"
              />
              <h3 className="text-md font-bold">
                On-Chain Settlement Progress
              </h3>
            </div>
            <EscrowProgressBar
              raised={campaign.raisedAmount || "0"}
              target={campaign.targetAmount || "0"}
            />
          </div>

          {campaign.milestones && campaign.milestones.length > 0 && (
            <div className="animate-in duration-700 fade-in slide-in-from-bottom-4">
              <MilestoneTimeline
                milestones={campaign.milestones}
                isCreator={isCreator}
                refetch={refetch}
              />
            </div>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:col-span-4">
          <div className="animate-in delay-100 duration-500 fade-in slide-in-from-right-4">
            <DonateSection
              campaignAddress={campaignAddress}
              campaign={campaign}
              refetch={refetch}
            />
          </div>

          {campaign.isLive && isCreator && (
            <div className="animate-in delay-200 duration-500 fade-in slide-in-from-right-4">
              <MilestoneProposalSection
                campaignAddress={campaignAddress}
                refetch={refetch}
              />
            </div>
          )}

          <Card className="rounded-xl border-border/50 bg-secondary/20 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  Network
                </span>
                <span className="text-sm font-bold text-foreground">
                  Ethereum Sepolia Testnet
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-border pt-4">
                <span className="text-sm font-bold text-muted-foreground">
                  Campaign Registry
                </span>
                <span className="truncate text-sm text-foreground opacity-50">
                  {campaignAddress}
                </span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

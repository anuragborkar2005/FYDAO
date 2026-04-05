"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import CampaignDetail from "@/components/campaign/camapign-details"

export default function CampaignDetailPage() {
  const { campaignAddress } = useParams() as { campaignAddress: string }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-[-5%] bottom-[-5%] h-[30%] w-[30%] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-in duration-500 fade-in slide-in-from-left-4">
          <Link
            href="/campaigns"
            className="group flex w-fit items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <div className="rounded-lg border border-border bg-secondary/50 p-1.5 transition-all group-hover:border-primary/30">
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                size={18}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </div>
            <span className="text-sm font-bold">Back to Registry</span>
          </Link>
        </div>

        <div className="animate-in duration-1000 fade-in">
          <CampaignDetail campaignAddress={campaignAddress as `0x${string}`} />
        </div>
      </div>
    </div>
  )
}

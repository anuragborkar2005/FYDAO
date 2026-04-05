"use client"

import { useAccount } from "wagmi"
import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  Blockchain02Icon,
  Copy01Icon,
  LicenseIcon,
  Tick01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"

export default function ProfilePage() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl animate-in space-y-12 px-4 py-12 duration-700 fade-in slide-in-from-bottom-4">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-primary/20 bg-primary/10 p-2.5">
            <HugeiconsIcon
              icon={UserCircleIcon}
              className="h-4 w-4 text-primary"
            />
          </div>
          <h1 className="text-xl font-bold text-foreground">My Profile</h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground opacity-80">
          Your unique blockchain identifier and activity summary within the
          FYDAO protocol.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Wallet Identity Card */}
        <Card className="group relative overflow-hidden rounded-xl border-border bg-card/50">
          <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />

          <CardHeader className="p-4 pb-4">
            <div className="mb-2 flex items-center gap-2">
              <HugeiconsIcon
                icon={Blockchain02Icon}
                className="h-4 w-4 text-primary"
              />
              <CardTitle className="text-sm font-bold text-muted-foreground">
                Verified Address
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="scroll-py-2 space-y-6 px-4 pt-0">
            <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-border/50 bg-secondary/50 px-4 py-3 transition-all group-hover:bg-secondary/70 sm:flex-row">
              <p className="text-sm font-medium break-all text-foreground opacity-90">
                {address || "NOT_CONNECTED"}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0 rounded-xl hover:bg-primary/10 hover:text-primary"
              >
                {copied ? (
                  <HugeiconsIcon icon={Tick01Icon} size={20} />
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} size={20} />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-sm font-bold text-muted-foreground">
                Network State: Connected to Sepolia
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contribution Summary Card */}
        <Card className="overflow-hidden rounded-3xl border-border bg-card/50">
          <CardHeader className="p-4 pb-4">
            <div className="mb-2 flex items-center gap-2">
              <HugeiconsIcon
                icon={LicenseIcon}
                className="h-4 w-4 text-primary"
              />
              <CardTitle className="text-sm font-bold text-muted-foreground">
                Consensus Record
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-10 pt-0">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-secondary/10 px-6 py-12">
              <HugeiconsIcon
                icon={Activity01Icon}
                className="mb-4 h-12 w-12 text-muted-foreground opacity-20"
              />
              <p className="max-w-xs text-center text-sm leading-relaxed font-medium text-muted-foreground italic opacity-70">
                Your historical donations and governance participations are
                being indexed from the ledger.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

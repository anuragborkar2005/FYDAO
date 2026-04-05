"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Blockchain02Icon,
  InformationCircleIcon,
  SafeIcon,
} from "@hugeicons/core-free-icons"

interface Props {
  raised: number | string
  target: number | string
}

export default function EscrowProgressBar({ raised, target }: Props) {
  const { raisedNum, targetNum, percent } = useMemo(() => {
    const r = parseFloat(raised?.toString() || "0")
    const t = parseFloat(target?.toString() || "1")
    const p = Math.min(Math.round((r / t) * 100), 100) || 0
    return { raisedNum: r, targetNum: t, percent: p }
  }, [raised, target])

  return (
    <Card className="group relative overflow-hidden rounded-xl border-border bg-card/50">
      <div
        className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
      />

      <CardContent className="px-6 py-2">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
              <HugeiconsIcon icon={SafeIcon} className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-muted-foreground">
                Vault Status
              </span>
              <h4 className="text-sm font-bold text-foreground">
                Escrow Governance
              </h4>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <span className="text-md mb-1 font-bold text-muted-foreground">
              On-Chain Capital
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">
                {raisedNum.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-muted-foreground opacity-50">
                / {targetNum.toLocaleString()} USDC
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar with Theme Glow */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-border/50 bg-secondary/50">
          <div
            className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-1000 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Blockchain02Icon}
              className="h-3.5 w-3.5 text-primary opacity-60"
            />
            <span className="text-xs font-bold text-muted-foreground">
              {percent >= 100
                ? "Goal Reached! Fully Funded"
                : `${percent}% Capital Contribution Ready`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/50 px-3 py-1">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              className="h-3.5 w-3.5 text-muted-foreground"
            />
            <span className="text-xs font-bold text-muted-foreground">
              DAO-Controlled Release
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

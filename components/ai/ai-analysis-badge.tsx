"use client"

import { Badge } from "@/components/ui/badge"
import {
  AiCloudIcon,
  AiSecurityIcon,
  Alert01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface Props {
  analysis?: {
    verdict: "positive" | "negative" | string
    confidence: number
    details?: string
  }
}

export default function AiAnalysisBadge({ analysis }: Props) {
  if (!analysis) return null

  const isPositive = analysis.verdict === "positive"

  const themeStyles = isPositive
    ? "border-primary/20 bg-primary/5 text-primary"
    : "border-destructive/20 bg-destructive/5 text-destructive"

  const barColor = isPositive ? "bg-primary" : "bg-destructive"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-secondary/30 p-5 backdrop-blur-md transition-all duration-300 hover:bg-secondary/50">
      {isPositive && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 animate-pulse rounded-full bg-primary/5 blur-2xl" />
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`rounded-lg border p-1.5 ${isPositive ? "border-primary/20 bg-primary/10" : "border-destructive/20 bg-destructive/10"}`}
          >
            {isPositive ? (
              <HugeiconsIcon icon={AiSecurityIcon} className="h-4 w-4" />
            ) : (
              <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
            )}
          </div>
          <Badge
            variant="outline"
            className={`${themeStyles} rounded-md border px-2.5 py-0.5 text-xs font-bold`}
          >
            AI Agent • {analysis.verdict}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground opacity-60">
            Confidence
          </span>
          <span
            className={`text-xs font-bold ${isPositive ? "text-primary" : "text-destructive"}`}
          >
            {analysis.confidence}%
          </span>
        </div>
      </div>

      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${barColor} shadow-[0_0_8px_rgba(var(--primary),0.3)] transition-all duration-1000 ease-out`}
          style={{ width: `${analysis.confidence}%` }}
        />
      </div>

      {analysis.details && (
        <div className="mt-4 flex gap-2.5 border-t border-border/50 pt-4">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
          />
          <p className="text-sm leading-relaxed font-medium text-muted-foreground italic opacity-80">
            {analysis.details}
          </p>
        </div>
      )}

      <div className="absolute right-3 bottom-2 flex items-center gap-1 opacity-20 transition-opacity group-hover:opacity-40">
        <HugeiconsIcon icon={AiCloudIcon} size={12} />
        <span className="text-[8px] font-bold">Verified Node</span>
      </div>
    </div>
  )
}

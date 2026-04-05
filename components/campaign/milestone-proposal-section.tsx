"use client"

import { useState } from "react"
import { useProposeMilestone } from "@/hooks/use-propose-milestone"
import { uploadFileAction } from "@/app/actions/pinata"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import AiAnalysisBadge from "../ai/ai-analysis-badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiCloudIcon,
  AiSecurityIcon,
  FileUploadIcon,
  LoadingIcon,
  MoneySendIcon,
  Task01Icon,
} from "@hugeicons/core-free-icons"

interface Props {
  campaignAddress: `0x${string}`
  refetch: () => void
}

export default function MilestoneProposalSection({
  campaignAddress,
  refetch,
}: Props) {
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [amount, setAmount] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)

  const { proposeMilestone, isLoading, currentStep } =
    useProposeMilestone(campaignAddress)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProofFile(e.target.files[0])
      setAiResult(null)
    }
  }

  const analyzeWithAI = async () => {
    if (!proofFile) return
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("file", proofFile)

      const uploadResult = await uploadFileAction(formData, {
        type: "milestone-proof",
      })

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofCid: uploadResult.cid,
          context: "Verifying completion proof for fund release.",
        }),
      })

      const data = await res.json()
      setAiResult({ ...data.aiResult, proofCid: uploadResult.cid })
    } catch (err) {
      console.error("AI Analysis Failed:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const submitMilestone = async () => {
    if (!aiResult?.proofCid || !amount) return

    proposeMilestone({
      proofCid: aiResult.proofCid,
      amount,
      aiResult,
    })

    refetch()
    setProofFile(null)
    setAiResult(null)
    setAmount("")
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-card/40 p-8 transition-all duration-500">
      <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-md border border-primary/20 bg-primary/10 p-2.5">
          <HugeiconsIcon icon={Task01Icon} className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            Request Milestone Release
          </h3>
          <p className="mt-0.5 text-sm font-bold text-muted-foreground">
            Automated AI Verification
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="ml-1 text-sm font-bold text-muted-foreground">
            Evidence of Work
          </Label>
          <div className="group relative cursor-pointer">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            />
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/20 py-8 transition-all group-hover:bg-secondary/40">
              <HugeiconsIcon
                icon={FileUploadIcon}
                className="mb-2 h-8 w-8 text-muted-foreground"
              />
              <p className="text-sm font-medium text-muted-foreground">
                {proofFile ? proofFile.name : "Click to upload proof (PDF/JPG)"}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={analyzeWithAI}
          disabled={!proofFile || isAnalyzing || !!aiResult}
          variant="outline"
          className="h-8 w-full rounded-md border-primary/30 bg-primary/5 font-bold text-primary hover:bg-primary/10"
        >
          {isAnalyzing ? (
            <>
              <HugeiconsIcon
                icon={LoadingIcon}
                className="mr-2 h-4 w-4 animate-spin"
              />{" "}
              Agent Analyzing...
            </>
          ) : aiResult ? (
            <>
              <HugeiconsIcon icon={AiSecurityIcon} className="mr-2 h-4 w-4" />{" "}
              Analysis Complete
            </>
          ) : (
            <>
              <HugeiconsIcon icon={AiCloudIcon} className="mr-2 h-4 w-4" />{" "}
              Verify with AI Agent
            </>
          )}
        </Button>

        {/* AI Analysis Component */}
        {aiResult && (
          <div className="animate-in duration-500 fade-in slide-in-from-top-2">
            <AiAnalysisBadge analysis={aiResult} />
          </div>
        )}

        <div className="space-y-2">
          <Label className="ml-1 text-sm font-bold text-muted-foreground">
            Release Request (USDC)
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-8 rounded-md border-border bg-secondary/30 pl-12 text-sm font-bold"
            />
            <HugeiconsIcon
              icon={MoneySendIcon}
              className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        <Button
          onClick={submitMilestone}
          disabled={isLoading || !aiResult || !amount}
          className="h-8 w-full rounded-md bg-primary text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {currentStep === "proposing-on-chain" ? (
            <>
              <HugeiconsIcon
                icon={LoadingIcon}
                className="mr-2 h-5 w-5 animate-spin"
              />{" "}
              Recording Proof...
            </>
          ) : currentStep === "creating-dao-proposal" ? (
            <>
              <HugeiconsIcon
                icon={LoadingIcon}
                className="mr-2 h-5 w-5 animate-spin"
              />{" "}
              Creating DAO Proposal...
            </>
          ) : (
            "Submit for Community Voting"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground opacity-60">
          Process: IPFS Upload → AI Audit → On-Chain Record → DAO Voting
        </p>
      </div>
    </div>
  )
}

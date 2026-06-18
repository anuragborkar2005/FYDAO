"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ConnectButton from "../wallet/connect-button"

import { useCreateCampaign } from "@/hooks/use-create-campaign"
import {
  uploadJsonToPinataAction,
  uploadFileAction,
} from "@/app/actions/pinata"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiCloudIcon,
  CheckListIcon,
  CloudUploadIcon,
  File01Icon,
  LoadingIcon,
} from "@hugeicons/core-free-icons"

const categories = [
  "Medical",
  "Disaster Relief",
  "Community",
  "Humanitarian",
  "Education",
  "Environment",
  "Other",
]

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  targetAmount: z.string().min(1, "Target amount is required"),
  category: z.string().min(1, "Please select a category"),
})

type FormData = z.infer<typeof schema>
type Step = 1 | 2 | 3

export default function CreateCampaignPage() {
  const router = useRouter()
  const { address } = useAccount()
  const {
    createCampaign,
    isLoading: isContractPending,
    syncToDb,
  } = useCreateCampaign()
  const [txHash, setTxHash] = React.useState<`0x${string}` | undefined>()
  const [aiResult, setAiResult] = React.useState<any>(null)
  const [submissionData, setSubmissionData] = React.useState<{
    vars: any
    fileCids: string[]
    data: FormData
    aiReview?: any
  } | null>(null)

  const { data: receipt, isLoading: isWaitingForReceipt } =
    useWaitForTransactionReceipt({
      hash: txHash,
    })

  const [currentStep, setCurrentStep] = React.useState<Step>(1)
  const [documents, setDocuments] = React.useState<File[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const selectedCategory = watch("category")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true)

      const docUploads = await Promise.all(
        documents.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)
          return uploadFileAction(formData, { type: "campaign-proof" })
        })
      )

      const fileCids = docUploads.map((res) => res.cid)

      const metadata = {
        ...data,
        documentCids: fileCids,
        creator: address,
        timestamp: Date.now(),
      }

      const uploadResult = await uploadJsonToPinataAction(metadata)

      // AI Analysis
      let trustScore = 75 // Default fallback
      let aiAnalysis = null

      if (fileCids.length > 0) {
        setIsAnalyzing(true)
        try {
          const aiResponse = await fetch("/api/ai/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              proofCid: fileCids[0],
              context: data.description,
            }),
          })
          if (aiResponse.ok) {
            const aiData = await aiResponse.json()
            aiAnalysis = aiData.aiResult
            trustScore = aiAnalysis.confidence
            setAiResult(aiAnalysis)
          }
        } catch (e) {
          console.error("AI Analysis failed:", e)
        } finally {
          setIsAnalyzing(false)
        }
      }

      const vars = {
        metadataURI: uploadResult.cid,
        targetAmount: data.targetAmount,
        trustScore: trustScore,
      }

      const { hash } = await createCampaign(vars)

      setSubmissionData({ vars, fileCids, data, aiReview: aiAnalysis })
      setTxHash(hash as `0x${string}`)
    } catch (error) {
      console.error("Submission failed", error)
    } finally {
      setIsUploading(false)
    }
  }

  React.useEffect(() => {
    if (receipt && txHash && submissionData && !isSyncing) {
      const performSync = async () => {
        setIsSyncing(true)
        try {
          await syncToDb(
            receipt,
            submissionData.vars,
            txHash,
            submissionData.fileCids,
            submissionData.data.title,
            submissionData.data.description,
            submissionData.data.category,
            submissionData.aiReview
          )
          setCurrentStep(3)
        } catch (e) {
          console.error("Sync failed", e)
        } finally {
          setIsSyncing(false)
        }
      }
      performSync()
    }
  }, [receipt, txHash, submissionData, isSyncing, syncToDb])

  const steps = [
    {
      id: 1,
      title: "Details",
      icon: <HugeiconsIcon icon={CheckListIcon} size={18} />,
    },
    {
      id: 2,
      title: "Proofs",
      icon: <HugeiconsIcon icon={File01Icon} size={18} />,
    },
    {
      id: 3,
      title: "Success",
      icon: <HugeiconsIcon icon={AiCloudIcon} size={18} />,
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Stepper UI */}
      <div className="mb-12 flex items-center justify-between px-8">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all ${
                  currentStep >= step.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`text-sm font-bold ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}
              >
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 rounded-full ${currentStep > step.id ? "bg-primary" : "bg-border"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {!address ? (
        <Card className="p-12 text-center">
          <p className="mb-6 font-medium text-muted-foreground">
            Connect your wallet to access the DAO Factory
          </p>
          <ConnectButton />
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 1 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Campaign Dossier
                </CardTitle>
                <CardDescription>
                  Define your mission and funding targets for DAO review.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Campaign Title</Label>
                  <Input
                    {...register("title")}
                    placeholder="e.g., Clean Water Initiative"
                    className="bg-secondary/50"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(val) => setValue("category", val)}
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target (USDC)</Label>
                    <Input
                      {...register("targetAmount")}
                      type="number"
                      className="bg-secondary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description & Impact</Label>
                  <Textarea
                    {...register("description")}
                    rows={5}
                    className="bg-secondary/50"
                  />
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Proofs
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Verification Proofs
                </CardTitle>
                <CardDescription>
                  Upload identity or necessity documents for AI Agentic
                  Analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="group relative rounded-2xl border-2 border-dashed border-border bg-secondary/20 p-12 text-center transition-all hover:border-primary/50">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <HugeiconsIcon
                    icon={CloudUploadIcon}
                    className="mx-auto mb-4 h-12 w-12 text-muted-foreground transition-colors group-hover:text-primary"
                  />
                  <p className="text-sm font-bold text-foreground">
                    Click to upload files
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, PNG, or JPG (Max 10MB)
                  </p>
                </div>

                <div className="space-y-3">
                  {documents.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3"
                    >
                      <span className="max-w-50 truncate text-sm">
                        {file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(i)}
                        className="text-destructive"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    className="flex-1"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      documents.length === 0 ||
                      isUploading ||
                      isAnalyzing ||
                      isContractPending ||
                      isWaitingForReceipt ||
                      isSyncing
                    }
                  >
                    {isUploading ? (
                      <>
                        <HugeiconsIcon
                          icon={LoadingIcon}
                          className="mr-2 animate-spin"
                          size={18}
                        />{" "}
                        IPFS Sync...
                      </>
                    ) : isAnalyzing ? (
                      <>
                        <HugeiconsIcon
                          icon={LoadingIcon}
                          className="mr-2 animate-spin"
                          size={18}
                        />{" "}
                        AI Auditing...
                      </>
                    ) : isContractPending ? (
                      <>
                        <HugeiconsIcon
                          icon={LoadingIcon}
                          className="mr-2 animate-spin"
                          size={18}
                        />{" "}
                        Sign Tx...
                      </>
                    ) : isWaitingForReceipt ? (
                      <>
                        <HugeiconsIcon
                          icon={LoadingIcon}
                          className="mr-2 animate-spin"
                          size={18}
                        />{" "}
                        Mining...
                      </>
                    ) : isSyncing ? (
                      <>
                        <HugeiconsIcon
                          icon={LoadingIcon}
                          className="mr-2 animate-spin"
                          size={18}
                        />{" "}
                        Finalizing...
                      </>
                    ) : (
                      "Submit to DAO"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="rounded-3xl border-primary/20 bg-card/50 p-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                <HugeiconsIcon
                  icon={AiCloudIcon}
                  className="text-primary"
                  size={40}
                />
              </div>
              <h2 className="mb-2 text-3xl font-bold">In DAO Review</h2>
              <p className="mb-8 text-muted-foreground">
                Your campaign has been broadcasted. Our AI agents are currently
                verifying your proofs against the FYDAO protocol.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/campaigns")}
                >
                  Browse Marketplace
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => router.push("/dashboard")}
                >
                  View Dashboard
                </Button>
              </div>
            </Card>
          )}
        </form>
      )}
    </div>
  )
}

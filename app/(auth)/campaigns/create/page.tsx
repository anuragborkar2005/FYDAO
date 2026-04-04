"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
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

import { useCreateCampaign } from "@/hooks/use-create-campaign"
import {
  uploadFileAction,
  uploadJsonToPinataAction,
} from "@/app/actions/pinata"
import { useConnection, usePublicClient } from "wagmi"
import ConnectButton from "@/components/wallet/connect-button"

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
  category: z.string().min(1, "Please select a category"),
  goal: z.string().min(1, "Target amount is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
})

type FormData = z.infer<typeof schema>
type Step = 1 | 2 | 3

export default function CreateCampaignPage() {
  const router = useRouter()
  const { address } = useConnection()
  const publicClient = usePublicClient()
  const {
    createCampaign,
    isLoading: isContractPending,
    syncToDb,
  } = useCreateCampaign()

  const [currentStep, setCurrentStep] = React.useState<Step>(1)
  const [documents, setDocuments] = React.useState<File[]>([])
  const [isUploading, setIsUploading] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "" },
  })

  const selectedCategory = watch("category")

  const onContinue = () => setCurrentStep(2)

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

      const documentCids = await Promise.all(
        documents.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)
          return await uploadFileAction(formData)
        })
      )

      const metadata = {
        title: data.title,
        description: data.description,
        targetAmount: data.goal,
        category: data.category,
        documents: documentCids.map((res) => res.cid),
        creator: address,
        timestamp: Date.now(),
      }

      const uploadResult = await uploadJsonToPinataAction(metadata)

      const { hash } = await createCampaign({
        metadataURI: uploadResult.cid,
        targetAmount: data.goal,
        trustScore: 92,
      })

      // 5. Wait for confirmation and Sync to DB
      if (publicClient && hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        await syncToDb(
          receipt,
          { metadataURI: uploadResult.cid, targetAmount: data.goal },
          hash
        )
      }

      setCurrentStep(3)
    } catch (error) {
      console.error("Submission failed", error)
    } finally {
      setIsUploading(false)
    }
  }

  const steps = [
    { id: 1, title: "Details", description: "Campaign info" },
    { id: 2, title: "Documents", description: "Upload proofs" },
    { id: 3, title: "Submit", description: "DAO review" },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create Campaign
          </h1>
          <p className="mt-2 text-muted-foreground">
            Launch your fundraising campaign in minutes
          </p>
        </div>

        {/* Progress Bar (Same UI) */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                      currentStep >= step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  <span className="mt-2 hidden text-xs text-muted-foreground sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 sm:mx-4 ${currentStep > step.id ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {!address ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">
              Please connect your wallet to start a campaign
            </p>
            <ConnectButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Campaign Details */}
            {currentStep === 1 && (
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Enter a compelling title"
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(val) => setValue("category", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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
                    <Label htmlFor="goal">Funding Goal (USDC)</Label>
                    <Input
                      id="goal"
                      type="number"
                      {...register("goal")}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Campaign Story</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      rows={6}
                      placeholder="Why do you need support?"
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <Button type="button" className="w-full" onClick={onContinue}>
                    Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Documents will be verified by AI and the DAO community.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                    <input
                      type="file"
                      id="documents"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="documents"
                      className="flex cursor-pointer flex-col items-center"
                    >
                      <svg
                        className="h-12 w-12 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-4 text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                    </label>
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      {documents.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/50 p-3"
                        >
                          <span className="max-w-50 truncate text-sm">
                            {file.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => removeFile(i)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      type="button"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      type="submit"
                      disabled={
                        documents.length === 0 ||
                        isUploading ||
                        isContractPending
                      }
                    >
                      {isUploading
                        ? "Uploading to IPFS..."
                        : isContractPending
                          ? "Signing Transaction..."
                          : "Submit to DAO"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                    <span className="text-3xl text-green-500">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold">Campaign Submitted!</h2>
                  <p className="mt-2 text-muted-foreground">
                    Your campaign is now in DAO Review. Our AI agents are
                    currently analyzing your documents.
                  </p>
                  <Button
                    className="mt-8 w-full"
                    onClick={() => router.push("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </form>
        )}
      </main>
      <Footer />
    </div>
  )
}

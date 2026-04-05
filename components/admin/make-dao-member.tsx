"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import RoleGuard from "../auth/role-guard"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BitcoinKeyIcon,
  Loading,
  ShieldUserIcon,
  Tick01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { useAdminActions } from "@/hooks/use-admin-actions"

export default function MakeDaoMember() {
  const [targetAddress, setTargetAddress] = useState("")
  const [amount, setAmount] = useState("1000")
  const { makeDaoMember, isLoading, isSuccess } = useAdminActions()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetAddress) return
    makeDaoMember({ targetAddress: targetAddress as `0x${string}`, amount })
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-lg py-10">
        <Card className="relative overflow-hidden border-border bg-card/50 shadow-2xl">
          {/* Subtle accent glow using theme primary color */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          <CardHeader className="space-y-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={ShieldUserIcon}
                  className="h-5 w-5 text-primary"
                />
              </div>
              <span className="text-sm font-bold text-muted-foreground">
                Governance Control
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Authorize Member
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Mint governance tokens to a specific wallet to grant DAO voting
              rights.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground/80">
                  Wallet Address
                </Label>
                <div className="relative">
                  <Input
                    id="address"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    placeholder="0x..."
                    className="border-border bg-secondary/50 pl-10 focus:ring-primary/40"
                  />
                  <HugeiconsIcon
                    icon={BitcoinKeyIcon}
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground/80">
                  Token Allocation
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-border bg-secondary/50 focus:ring-primary/40"
                  />
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-bold text-primary">
                    GOV
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !targetAddress}
                className="h-12 w-full rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Loading}
                      className="h-4 w-4 animate-spin"
                    />
                    <span>Processing Chain...</span>
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4" />
                    <span>Member Authorized</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4" />
                    <span>Grant DAO Access</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}

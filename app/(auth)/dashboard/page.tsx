"use client"

import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGovernanceToken } from "@/hooks/use-governance-token"
import RoleGuard from "@/components/auth/role-guard"
import MakeDaoMember from "@/components/admin/make-dao-member"
import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiSearchIcon,
  Blockchain02Icon,
  DashboardCircleIcon,
  PlusSignIcon,
  Task01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons"

export default function DashboardOverview() {
  const { address } = useAccount()
  const { votingPower, totalSupply } = useGovernanceToken()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])
  if (!mounted) return null

  return (
    <div className="animate-in space-y-12 duration-700 fade-in slide-in-from-bottom-4">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-sm border border-primary/20 bg-primary/10 p-1.5">
              <HugeiconsIcon
                icon={DashboardCircleIcon}
                className="h-4 w-4 text-primary"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          </div>
          <p className="text-md font-medium text-muted-foreground">
            Identity:{" "}
            <span className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary">
              {address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "AUTH_PENDING"}
            </span>
          </p>
        </div>

        <RoleGuard allowedRoles={["dao_member", "admin"]}>
          <Link href="/campaigns/create">
            <Button
              size="lg"
              className="h-10 bg-primary px-5 font-bold text-primary-foreground shadow-primary/20 transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="mr-3 h-5 w-5" />
              Launch Campaign
            </Button>
          </Link>
        </RoleGuard>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Voting Power",
            value: votingPower,
            icon: <HugeiconsIcon icon={ZapIcon} className="text-primary" />,
            desc: "GTK Balance",
            primary: true,
          },
          {
            label: "Total DAO Stake",
            value: totalSupply,
            icon: (
              <HugeiconsIcon
                icon={Blockchain02Icon}
                className="text-indigo-400"
              />
            ),
            desc: "Circulating Supply",
          },
          {
            label: "My Proposals",
            value: "3",
            icon: (
              <HugeiconsIcon icon={Task01Icon} className="text-amber-400" />
            ),
            desc: "1 Pending Approval",
          },
          {
            label: "Participation",
            value: "12",
            icon: <HugeiconsIcon icon={ZapIcon} className="text-blue-400" />,
            desc: "Votes Cast This Season",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="relative overflow-hidden border-border bg-card/50 transition-all duration-500 hover:bg-card/80"
          >
            {stat.primary && (
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-primary/10 blur-2xl" />
            )}
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <div className="rounded-lg border border-border bg-secondary/50 p-2">
                  {stat.icon}
                </div>
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stat.primary ? "text-primary" : "text-foreground"}`}
              >
                {stat.value || "0"}
              </div>
              <p className="text-md mt-2 font-semibold text-muted-foreground/50">
                {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Immersive Quick Actions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Link href="/campaigns/create" className="group">
          <Card className="h-full overflow-hidden rounded-3xl border-border bg-card/40 transition-all duration-500 hover:border-primary/50 hover:bg-card/60">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-[120px] transition-all group-hover:bg-primary/10" />
            <CardContent className="relative z-10 flex flex-col items-center p-12 text-center">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-inner transition-transform duration-700 group-hover:scale-110">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="h-8 w-8 text-primary"
                />
              </div>
              <h3 className="mb-4 text-xl font-bold text-foreground">
                Create Campaign
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground opacity-80">
                Pitch your vision and secure decentralized funding from the
                global community.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/governance" className="group">
          <Card className="h-full overflow-hidden rounded-3xl border-border bg-card/40 transition-all duration-500 hover:border-violet-500/50 hover:bg-card/60">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-violet-500/5 blur-[120px] transition-all group-hover:bg-violet-500/10" />
            <CardContent className="relative z-10 flex flex-col items-center p-12 text-center">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 shadow-inner transition-transform duration-700 group-hover:scale-110">
                <HugeiconsIcon
                  icon={ZapIcon}
                  className="h-8 w-8 text-violet-400"
                />
              </div>
              <h3 className="mb-4 text-xl font-bold text-foreground">
                DAO Governance
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground opacity-80">
                Use your voting power to shape the future of active projects and
                protocol releases.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Administrative Access */}
      <div className="border-t border-border/50 pt-8">
        <div className="mb-6 flex items-center gap-2 px-4">
          <HugeiconsIcon
            icon={AiSearchIcon}
            size={18}
            className="text-primary"
          />
          <span className="text-sm font-bold text-muted-foreground">
            Administrative Controls
          </span>
        </div>
        <MakeDaoMember />
      </div>
    </div>
  )
}

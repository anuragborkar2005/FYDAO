"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import {
  Award01Icon,
  ChartLine,
  DashboardCircleIcon,
  Settings02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface Props {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname()

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: DashboardCircleIcon },
    {
      label: "My Campaigns",
      href: "/dashboard/campaigns",
      icon: ChartLine,
    },
    { label: "My Votes", href: "/dashboard/votes", icon: Award01Icon },
    {
      label: "Governance",
      href: "/dashboard/governance",
      icon: UserGroupIcon,
    },
  ]

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* Background Atmosphere - Consistent with Campaign Detail Page */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] h-[30%] w-[30%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-[5%] bottom-[10%] h-[25%] w-[25%] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-2 py-10 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="shrink-0 lg:w-72">
            <Card className="sticky top-28 overflow-hidden rounded-lg border-border bg-card/50">
              <CardContent>
                <div className="mb-4 px-4 py-4">
                  <span className="text-xs font-bold text-muted-foreground opacity-50">
                    Menu
                  </span>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-md px-5 py-2 transition-all duration-300 ${
                          isActive
                            ? "bg-primary font-bold text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={Icon}
                          size={20}
                          className={
                            isActive
                              ? "text-primary-foreground"
                              : "transition-colors group-hover:text-primary"
                          }
                        />
                        <span className="text-sm">{item.label}</span>

                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
                        )}
                      </Link>
                    )
                  })}
                </nav>

                {/* Footer Section in Sidebar */}
                <div className="mt-10 border-t border-border/50 px-4 pt-6">
                  <button className="group flex items-center gap-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    <HugeiconsIcon
                      icon={Settings02Icon}
                      size={18}
                      className="transition-transform duration-500 group-hover:rotate-45"
                    />
                    <span>Settings</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="min-w-0 flex-1 animate-in duration-700 fade-in slide-in-from-bottom-2">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

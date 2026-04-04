"use client"

import { usePathname } from "next/navigation"
import React from "react"
import { useUserRole } from "@/hooks/use-user-role"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { DashboardSquare02Icon } from "@hugeicons/core-free-icons"
import { ThemeToggle } from "./ui/theme-toggle"
import ConnectButton from "./wallet/connect-button"

const allNavItems = [
  { href: "/campaigns", label: "Explore", requiresAuth: false },
  {
    href: "/create",
    label: "Start Campaign",
    requiresAuth: true,
    roles: ["creator", "admin"],
  },
  {
    href: "/dao",
    label: "DAO Voting",
    requiresAuth: true,
    roles: ["dao_member", "admin"],
  },
  { href: "/transparency", label: "Transparency", requiresAuth: true },
]

export function Navigation() {
  const pathname = usePathname()

  const { isConnected, hasRole } = useUserRole()

  const getVisibleNavItems = () => {
    return allNavItems.filter((item) => {
      if (!item.requiresAuth) return true
      if (!isConnected) return false
      if (!item.roles) return true
      return item.roles.some((role: string) => hasRole(role))
    })
  }

  const visibleNavItems = getVisibleNavItems()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <HugeiconsIcon icon={DashboardSquare02Icon} />
          <nav className="hidden items-center gap-1 md:flex">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-2 sm:flex">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
}

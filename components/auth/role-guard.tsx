"use client"

import { useUserRole } from "@/hooks/use-user-role"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export default function RoleGuard({ children, allowedRoles, fallback }: Props) {
  const { hasRole, isAdmin } = useUserRole()

  if (isAdmin) {
    return <>{children}</>
  }

  const hasAccess = allowedRoles.some((role) => hasRole(role))

  if (!hasAccess) {
    return (
      fallback || (
        <div className="rounded-3xl border p-8 text-center">
          <p className="text-red-700">Access Denied</p>
          <p className="mt-2 text-zinc-500">
            You don&apos;t have the required role for this action.
          </p>
        </div>
      )
    )
  }

  return <>{children}</>
}

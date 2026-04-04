import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/campaigns") ||
    pathname.startsWith("/governance") ||
    pathname.startsWith("/profile")
  ) {
    const hasWalletSession =
      request.cookies.get("wallet-connected")?.value === "true"

    if (!hasWalletSession) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/campaigns/:path*",
    "/governance/:path*",
    "/profile/:path*",
  ],
}

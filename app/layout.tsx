import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { headers } from "next/headers"
import "./globals.css"
import ContextProvider from "@/context"
import { Navigation } from "@/components/navigation"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "DAO Crowdfunding App",
  description:
    "Governance-powered crowdfunding with escrow and AI verification",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const cookies = headersObj.get("cookie")
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>
          <ContextProvider cookies={cookies}>
            <TooltipProvider>
              <Navigation />
              {children}
            </TooltipProvider>
          </ContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

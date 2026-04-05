"use client"

import { wagmiAdapter, projectId } from "@/config"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from "@reown/appkit/react"
import { sepolia } from "@reown/appkit/networks"
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
})

if (!projectId) {
  throw new Error("Project ID is not defined")
}

const metadata = {
  name: "FYDAO - AI Assisted DAO Crowdfunding",
  description:
    "Decentralized crowdfunding with governance, escrow & AI milestone verification",
  url: "http://localhost:3000", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata: metadata,
  features: {
    analytics: true,
  },
  themeVariables: {
    "--apkt-font-family": "Inter",
    "--apkt-accent": "#007a55",
    "--apkt-border-radius-master": "5px",
  },
  themeMode: "light",
})

function ContextProvider({
  children,
  cookies,
}: {
  children: React.ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  )

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider

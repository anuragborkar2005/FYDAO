"use client"

import { useAccount, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { sepolia } from "viem/chains"
import { localchain } from "@/config"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChevronDown } from "@hugeicons/core-free-icons"

export default function ChainSwitcher() {
  const { chain } = useAccount()
  const switchChain = useSwitchChain()

  const chains = [sepolia, localchain]

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="rounded-2xl border-zinc-700">
        {chain?.name || "Select Chain"}
        <HugeiconsIcon icon={ChevronDown} className="ml-2 h-4 w-4" />
      </Button>
      <div className="hidden gap-1 md:flex">
        {chains.map((c) => (
          <Button
            key={c.id}
            variant={chain?.id === c.id ? "default" : "outline"}
            size="sm"
            onClick={() => switchChain.mutate({ chainId: c.id })}
            className="rounded-2xl"
          >
            {c.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

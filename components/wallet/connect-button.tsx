"use client"

import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu"
import { useDisconnect } from "wagmi"
import { useEffect } from "react"
import { Profile, WalletIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"

export default function ConnectButton() {
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  useEffect(() => {
    if (isConnected && address) {
      document.cookie = `wallet-connected=true; path=/; max-age=86400`
    }
  }, [isConnected, address])

  if (!isConnected) {
    return (
      <Button onClick={() => open()}>
        <HugeiconsIcon icon={WalletIcon} />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-fit px-2 py-1.5">
          <HugeiconsIcon icon={Profile} />
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            router.push("/profile")
          }}
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

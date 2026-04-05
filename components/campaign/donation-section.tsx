"use client"

import { useEffect, useState } from "react"
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi"
import { parseUnits } from "viem"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { ICampaign } from "@/types"
import { useDonate } from "@/hooks/use-donate"
import { ABIS, CONTRACT_ADDRESSES, TOKEN_DECIMALS } from "@/contracts/config"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiSecurityIcon,
  InformationCircleIcon,
  LoadingIcon,
  LockIcon,
  MoneySend01Icon,
} from "@hugeicons/core-free-icons"

interface Props {
  campaignAddress: `0x${string}`
  campaign: ICampaign
  refetch: () => void
}

export default function DonateSection({
  campaignAddress,
  campaign,
  refetch,
}: Props) {
  const { address } = useAccount()
  const [amount, setAmount] = useState("")

  const raised = parseFloat(campaign.raisedAmount || "0")
  const target = parseFloat(campaign.targetAmount || "0")
  const isEnded = raised >= target && target > 0

  const { donate, isLoading: isDonating } = useDonate(campaignAddress)

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDC as `0x${string}`,
    abi: ABIS.MockUSDC,
    functionName: "allowance",
    args: address ? [address, campaignAddress] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { writeContractAsync, data: approveHash } = useWriteContract()

  const {
    data: receipt,
    isLoading: isConfirmingApprove,
    isSuccess: isApproveSucess,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  useEffect(() => {
    if (isApproveSucess && amount) {
      console.log("Transaction Confirmed:", receipt)
      refetchAllowance()
      // Automatically proceed to donate
      donate({ amount })
      setAmount("")
    }
  }, [isApproveSucess, receipt, refetchAllowance, amount, donate])

  const currentAmountRaw = amount ? parseUnits(amount, TOKEN_DECIMALS.USDC) : 0n
  const needsApproval = !allowance || (allowance as bigint) < currentAmountRaw

  const handleAction = async () => {
    if (!amount) return

    try {
      if (needsApproval) {
        await writeContractAsync({
          address: CONTRACT_ADDRESSES.MockUSDC as `0x${string}`,
          abi: ABIS.MockUSDC,
          functionName: "approve",
          args: [campaignAddress, currentAmountRaw],
        })
      } else {
        donate({ amount })
        setAmount("")
        refetch()
      }
    } catch (error) {
      console.error("Action failed", error)
    }
  }

  const isBusy = isDonating || isConfirmingApprove

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card/40 px-6 py-4 backdrop-blur-xl transition-all duration-500">
      {/* Top Glow Decor */}
      <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-2.5">
          <HugeiconsIcon
            icon={MoneySend01Icon}
            className="h-4 w-4 text-primary"
          />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Support Growth</h3>
          <p className="mt-0.5 text-xs font-bold text-muted-foreground">
            Secure USDC Contribution
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-8 border-border bg-secondary/30 pr-3 pl-4 text-sm font-bold transition-all placeholder:text-muted-foreground/30 focus:ring-primary/20"
          />
          <div className="absolute top-1/2 right-6 flex -translate-y-1/2 items-center gap-2">
            <span className="text-xs font-bold text-primary">USDC</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleAction}
            disabled={isBusy || !campaign.isLive || !amount || isEnded}
            className={`h-8 rounded-md text-sm font-bold shadow-lg transition-all duration-300 ${
              isEnded
                ? "bg-muted text-muted-foreground shadow-none"
                : needsApproval
                  ? "border border-border bg-secondary text-foreground shadow-none hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90"
            }`}
          >
            {isBusy ? (
              <div className="flex items-center gap-3">
                <HugeiconsIcon
                  icon={LoadingIcon}
                  className="h-4 w-4 animate-spin"
                />
                <span>Processing...</span>
              </div>
            ) : isEnded ? (
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={LockIcon} className="h-4 w-4" />
                <span>Campaign Ended</span>
              </div>
            ) : needsApproval ? (
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={LockIcon} className="h-4 w-4" />
                <span>Set Spending Cap</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={AiSecurityIcon} className="h-4 w-4" />
                <span>Confirm Donation</span>
              </div>
            )}
          </Button>

          {!campaign.isLive && (
            <div className="flex h-8 items-center justify-center gap-2 rounded-md border border-destructive/10 bg-destructive/5 px-4 py-3">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="h-4 w-4 text-destructive"
              />
              <p className="text-sm font-bold text-destructive">
                Verification Pending
              </p>
            </div>
          )}

          {isEnded && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="h-4 w-4 text-primary"
              />
              <p className="text-sm font-bold text-primary">
                Goal Reached! Funding is closed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

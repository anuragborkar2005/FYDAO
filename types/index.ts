import { Document } from "mongoose"

export interface ICampaign extends Document {
  onChainAddress: string
  factoryTxHash?: string
  creator: string
  title?: string
  description?: string
  category?: string
  metadataCid: string
  fileCid: string[]
  status: "created" | "pending_approval" | "live" | "rejected" | "completed"
  isLive: boolean
  approvalProposalId?: string
  escrowAddress?: string
  targetAmount?: string
  raisedAmount?: string
  aiReview?: {
    reportCid?: string
    confidence?: number
    summary?: string
  }
  createdAt: Date
  approvedAt?: Date
  milestones?: IMilestone[]
}

export interface IMilestone extends Document {
  campaignAddress: string
  milestoneId: number
  proofCid: string
  amount: string
  status: "proposed" | "voting" | "approved" | "released" | "rejected"

  aiAnalysis?: {
    reportCid: string
    verdict: "positive" | "negative" | "neutral"
    confidence: number
    details: string
  }
  proposalId?: string
  daoProposal?: IProposal
  createdAt: Date
}

export interface IProposal extends Document {
  proposalId: string
  description: string
  targets: string[]
  values: string[]
  calldatas: string[]
  proposer: string
  status:
    | "pending"
    | "active"
    | "succeeded"
    | "defeated"
    | "executed"
    | "canceled"
    | "queued"
  isCampaignApproval?: boolean
  isMilestoneRelease?: boolean
  campaignAddress?: string
  milestoneId?: number
  votesFor: string
  votesAgainst: string
  votesAbstain: string
  endTime?: Date
  createdAt: Date
}

export interface IUser extends Document {
  address: string
  votingPower?: string
  createdAt: Date
}

export interface IVote extends Document {
  proposalId: string
  voter: string
  support: number
  weight: number
  txHash?: string
  createdAt: Date
}

export type UserRole = "donor" | "creator" | "dao_member" | "admin"

export interface UserWithRole {
  address: string
  roles: UserRole[]
  votingPower: string
  isAdmin: boolean
}

export interface IDonation {
  campaignAddress: `0x${string}`
  donor: `0x${string}`
  amount: string
  txHash: string
  blockNumber: string
  status: string
}

export interface ApiResponse {
  success: boolean
  message?: string
  error?: string
}

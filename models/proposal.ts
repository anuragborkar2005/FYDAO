import { IProposal } from "@/types"
import mongoose, { Schema } from "mongoose"

const ProposalSchema = new Schema<IProposal>({
  proposalId: { type: String, required: true, unique: true },
  description: String,
  targets: [String],
  values: [String],
  calldatas: [String],
  proposer: String,
  status: { type: String, default: "pending" },
  isCampaignApproval: Boolean,
  isMilestoneRelease: Boolean,
  campaignAddress: String,
  milestoneId: Number,
  votesFor: { type: String, default: "0" },
  votesAgainst: { type: String, default: "0" },
  votesAbstain: { type: String, default: "0" },
  endTime: Date,
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Proposal ||
  mongoose.model<IProposal>("Proposal", ProposalSchema)

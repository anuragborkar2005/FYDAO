import { ICampaign } from "@/types"
import mongoose, { Schema } from "mongoose"

const CampaignSchema = new Schema<ICampaign>({
  onChainAddress: { type: String, required: true, unique: true, index: true },
  creator: { type: String, required: true },
  metadataCid: { type: String, required: true },
  fileCid: { type: [String], required: true },
  status: {
    type: String,
    enum: ["created", "pending_approval", "live", "rejected", "completed"],
    default: "created",
  },
  isLive: { type: Boolean, default: false },
  approvalProposalId: { type: String },
  escrowAddress: { type: String, index: true },
  factoryTxHash: String,
  targetAmount: String,
  raisedAmount: String,
  aiReview: {
    reportCid: String,
    confidence: Number,
    summary: String,
  },
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date,
})

export default mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema)

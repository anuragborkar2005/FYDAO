import { IVote } from "@/types"
import mongoose, { Schema } from "mongoose"

const VoteSchema = new Schema<IVote>({
  proposalId: { type: String, required: true },
  voter: { type: String, required: true },
  support: { type: Number, required: true },
  weight: { type: Number, required: true },
  txHash: String,
  createdAt: { type: Date, default: Date.now },
})

// Create an index for faster lookups
VoteSchema.index({ proposalId: 1, voter: 1 }, { unique: true })

export default mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema)

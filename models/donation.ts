import { IDonation } from "@/types"
import mongoose, { Schema } from "mongoose"

const DonationSchema = new Schema<IDonation>(
  {
    campaignAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    donor: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    amount: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    blockNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "confirmed",
    },
  },
  { timestamps: true }
)

export default mongoose.models.Donation ||
  mongoose.model<IDonation>("Donation", DonationSchema)

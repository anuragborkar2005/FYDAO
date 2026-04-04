import { IUser } from "@/types"
import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema<IUser>({
  address: { type: String, required: true, unique: true },
  votingPower: String,
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

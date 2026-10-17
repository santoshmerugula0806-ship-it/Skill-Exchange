import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    status: { type: String, enum: ["matching", "active", "ended"], default: "matching" },
    teachSkill: String,
    learnSkill: String,
    startedAt: Date,
    endedAt: Date,
    rewarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);

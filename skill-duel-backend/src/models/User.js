import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    role: { type: String, default: "" },
    skillsTeaching: [{ type: String }],
    skillsLearning: [{ type: String }],
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

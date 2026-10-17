import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
});

export default mongoose.model("Badge", badgeSchema);

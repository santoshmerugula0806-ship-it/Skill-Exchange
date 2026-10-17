/**
 * Seeds the default badge set. Run once with: node src/utils/seed.js
 * Safe to re-run — uses upsert so it won't create duplicates.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import Badge from "../models/Badge.js";

const badges = [
  { name: "First Duel", description: "Complete your first skill exchange session", icon: "handshake" },
  { name: "10 Sessions", description: "Complete 10 skill exchange sessions", icon: "flame" },
  { name: "50 Sessions", description: "Complete 50 skill exchange sessions", icon: "trophy" },
  { name: "Mentor", description: "Teach 5 different skills to others", icon: "graduation-cap" },
  { name: "Fast Learner", description: "Learn 5 different skills from others", icon: "zap" },
];

const run = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected — seeding badges...");

  for (const badge of badges) {
    await Badge.findOneAndUpdate({ name: badge.name }, badge, {
      upsert: true,
      new: true,
    });
    console.log(`  ✓ ${badge.name}`);
  }

  console.log("Done.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

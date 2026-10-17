import express from "express";
import { getAllBadges, getMyBadges } from "../controllers/badge.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllBadges); // public — browsable badge list
router.get("/mine", protect, getMyBadges);

export default router;

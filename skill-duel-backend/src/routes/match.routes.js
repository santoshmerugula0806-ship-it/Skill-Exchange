import express from "express";
import { getMatches, getMatchById, endMatch } from "../controllers/match.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMatches);
router.get("/:id", getMatchById);
router.post("/:id/end", endMatch);

export default router;

import express from "express";
import { signup, signin, signout, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate, signupValidation, signinValidation } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/signup", signupValidation, validate, signup);
router.post("/signin", signinValidation, validate, signin);
router.post("/signout", signout);
router.get("/me", protect, getMe);

export default router;

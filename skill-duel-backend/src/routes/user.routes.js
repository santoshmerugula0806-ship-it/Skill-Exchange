import express from "express";
import { searchUsers, getUserById, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate, updateProfileValidation } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(protect); // every route below requires authentication

router.get("/search", searchUsers);
router.put("/me", updateProfileValidation, validate, updateProfile);
router.get("/:id", getUserById);

export default router;

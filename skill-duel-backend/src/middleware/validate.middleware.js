import { body, validationResult } from "express-validator";

/**
 * Runs after the express-validator chains below have populated any errors
 * onto the request. Returns a 400 with all messages instead of letting a
 * bad request reach the controller.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

export const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const signinValidation = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ max: 60 })
    .withMessage("Name must be 60 characters or fewer"),
  // checkFalsy lets users clear their avatar by sending ""
  body("avatar")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Avatar must be a valid URL"),
  body("role")
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage("Role must be 80 characters or fewer"),
  body("skillsTeaching").optional().isArray().withMessage("skillsTeaching must be an array"),
  body("skillsLearning").optional().isArray().withMessage("skillsLearning must be an array"),
];

import express from "express";
import { body, validationResult } from "express-validator";
import {
  addUser,
  login,
  sendEmailResetPassword,
  userPasswordReset,
  changeUserPassword,
} from "../controllers/user.controllers.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Registration
router.post(
  "/register",
  (req, res, next) => {
    console.log("register");
    next();
  },
  addUser
);

// Login
router.post(
  "/login",
  (req, res, next) => {
    console.log("/login");
    next();
  },
  login
);

// Password reset routes
router.post(
  "/send-reset-password",
  [body("email").isEmail(), handleValidationErrors],
  sendEmailResetPassword
);

router.post(
  "/reset-password/:id/:token",
  [body("newPassword").isLength({ min: 5 }), handleValidationErrors],
  userPasswordReset
);

// Change password (authenticated route)
router.post(
  "/change-password",
  [
    authenticateUser,
    body("currentPassword").isLength({ min: 5 }),
    body("newPassword").isLength({ min: 5 }),
    handleValidationErrors,
  ],
  changeUserPassword
);

// Protected route example
router.get("/protected-route", authenticateUser, (req, res) => {
  res.json({
    status: "success",
    message: "Protected route accessed",
    user: req.user,
  });
});

export default router;

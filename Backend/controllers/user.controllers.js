// user.controllers.js
import userModel from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { GenerateOfferLetter } from "./certificate.controller.js";

// Add User (Register)
export const addUser = async (req, res) => {
  try {
    const {
      name,
      email,
      startDate,
      endDate,
      departmentName,
      password,
      ...otherDetails
    } = req.body;
    console.log(email, password);

    // Check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "failed",
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      startDate,
      endDate,
      departmentName,
      ...otherDetails,
    });

    const savedUser = await newUser.save();
    const parameter = {
      name,
      email,
      departmentName,
      startDate,
      endDate,
    };
    console.log("userController", parameter);
    await GenerateOfferLetter(parameter);

    // Generate token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" }
    );
    res.cookie("authToken", token, {
      httpOnly: false, // Allow document.cookie access (for testing only; remove in production)
      sameSite: "Lax", // Suitable for same-origin requests
      secure: false, // Set to true in production (HTTPS required)
    });

    res.status(201).json({
      status: "success",
      user: {
        department: savedUser.departmentName,
        email: savedUser.email,
        name: savedUser.name,
        startDate: savedUser.startDate,
        endDate: savedUser.endDate,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({
      status: "failed",
      message: "Registration failed",
    });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid credentials",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });

    res.cookie("authToken", token, {
      httpOnly: false, // Allow document.cookie access (for testing only; remove in production)
      sameSite: "Lax", // Suitable for same-origin requests
      secure: false, // Set to true in production (HTTPS required)
    });
    res.json({
      status: "success",
      user: {
        email: user.email,
        name: user.name,
        department: user.departmentName,
        startDate: user.startDate,
        endDate: user.endDate,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "failed",
      message: "Login failed",
    });
  }
};

// Send Password Reset Email
export const sendEmailResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${process.env.FRONTEND_URL}/reset-password/${user._id}/${resetToken}">
                    Reset Password
                </a>
                <p>This link will expire in 1 hour.</p>
            `,
    });

    res.json({
      status: "success",
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Password reset email error:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to send password reset email",
    });
  }
};

// Reset Password
export const userPasswordReset = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { newPassword } = req.body;

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid or expired token",
      });
    }

    // Find user and verify token
    const user = await userModel.findOne({
      _id: id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid or expired reset link",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to reset password",
    });
  }
};

// Change Password
export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId; // From auth middleware

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({
        status: "failed",
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      status: "failed",
      message: "Failed to change password",
    });
  }
};

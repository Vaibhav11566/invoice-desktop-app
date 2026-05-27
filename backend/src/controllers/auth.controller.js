import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email and password are required.",
      });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already registered. Please login.",
      });
    }

    // Create user
    const user = await User.create({ name, email, password, phone });

    const token = generateToken(user._id);

    return res.status(201).json({
      status: "success",
      message: "Account created successfully.",
      data: { user, token },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Registration failed.",
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required.",
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password.",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        status: "fail",
        message: "Account is deactivated. Contact admin.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      data: { user, token },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Login failed.",
    });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "User profile fetched.",
      data: { user: req.user },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch profile.",
    });
  }
};

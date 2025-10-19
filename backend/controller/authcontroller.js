import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { genToken } from "../config/token.js";

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const token = genToken(newUser._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "User created",
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
        token,
      });
  } catch (err) {
    console.error("SignUp error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = genToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          assistantName: user.assistantName,
          assistantImage: user.assistantImage,
        },
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" })
    .status(200)
    .json({ message: "Logged out successfully" });
};

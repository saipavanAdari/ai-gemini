import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import geminiResponse from "./gemini.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  // origin: "https://ai-varun-6ehc.onrender.com",
credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Add this route
app.post("/api/gemini", async (req, res) => {
  try {
    const { command, assistantName, userName } = req.body;
    const result = await geminiResponse(command, assistantName, userName);
    res.json(result);
  } catch (error) {
    console.error("Gemini API error:", error.message);
    res.status(500).json({ error: "Failed to fetch Gemini response" });
  }
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });

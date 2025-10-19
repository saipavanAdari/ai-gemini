import User from "../model/user.model.js";
import { uploadOnCloudinary } from "../config/uploadOnCloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const userId = req.user._id;
    const { assistantName, imageUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (assistantName) user.assistantName = assistantName;

    if (req.file) {
      const localPath = req.file.path;
      try {
        const uploadedUrl = await uploadOnCloudinary(localPath);
        user.assistantImage = uploadedUrl;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        user.assistantImage = `/public/${req.file.filename}`;
      }
    } else if (imageUrl) {
      user.assistantImage = imageUrl;
    }

    await user.save();

    const { password, ...updatedUser } = user.toObject();
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating assistant:", err);
    res.status(500).json({ message: "Failed to update assistant" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ensure history exists
    if (!Array.isArray(user.history)) user.history = [];
    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    const result = await geminiResponse(command, assistantName, userName);
    const jsonMatch = typeof result === "string" ? result.match(/{[\s\S]*}/) : null;

    if (!jsonMatch) {
      // try if result is an object
      if (typeof result === "object" && result.response) {
        return res.json(result);
      }
      return res.status(500).json({ message: "Invalid response from assistant" });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;

    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("Do MMMM YYYY")}`,
        });

      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("h:mm A")}`,
        });

      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current month is ${moment().format("MMMM")}`,
        });

      case "youtube-search":
      case "youtube-play":
      case "google-search":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
      case "general":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });

      default:
        return res.status(500).json({ message: "Unknown type from assistant" });
    }
  } catch (error) {
    console.error("Error in askToAssistant:", error);
    res.status(500).json({ message: "Failed to get response from assistant" });
  }
};

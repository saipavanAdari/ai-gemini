import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.header("Authorization") || "";
      if (authHeader.startsWith("Bearer ")) token = authHeader.replace("Bearer ", "");
      else token = authHeader;
    }

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuth;

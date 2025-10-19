import jwt from "jsonwebtoken";

export const genToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "10d" });
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  assistantName: { type: String },
  assistantImage: { type: String },
  // make history an array so you can push
  history: [{ type: String }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;

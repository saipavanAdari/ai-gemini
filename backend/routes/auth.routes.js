import express from "express";
import { signUp, login, logout } from "../controller/authcontroller.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", login);
router.get("/logout", logout);

export default router;

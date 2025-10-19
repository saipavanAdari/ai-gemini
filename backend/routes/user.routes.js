import express from "express";
import { askToAssistant, getCurrentUser, updateAssistant } from "../controller/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/current", isAuth, getCurrentUser);
router.put("/updateAssistant", isAuth, upload.single("assistantImage"), updateAssistant);
router.post("/asktoassistant", isAuth, askToAssistant);

export default router;

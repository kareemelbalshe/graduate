import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";
import validateObject from "../middlewares/validateObject.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = new Router()

router.get("/:id", validateObject,verifyToken ,getMessages);
router.post("/send/:id", validateObject, verifyToken, sendMessage);

export default router
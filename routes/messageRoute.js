import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";
import validateObject from "../middlewares/validateObject.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isBlock } from "../middlewares/isBlock.js";

const router = new Router()

router.get("/:id",isBlock, validateObject,verifyToken ,getMessages);
router.post("/send/:id",isBlock, validateObject, verifyToken, sendMessage);

export default router
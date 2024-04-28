import { Router } from "express";
import { deleteMessage, getMessages, sendMessage } from "../controllers/messageController.js";
import validateObject from "../middlewares/validateObject.js";
import { verifyToken, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import { isBlock } from "../middlewares/isBlock.js";

const router = new Router()

router.get("/:id",validateObject,verifyToken ,isBlock, getMessages);
router.delete("/message/:id",validateObject,verifyTokenAndOnlyUser ,isBlock, deleteMessage)
router.post("/send/:id", validateObject, verifyToken, isBlock, sendMessage);

export default router
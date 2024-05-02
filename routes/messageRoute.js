import { Router } from "express";
import { deleteConversation, deleteMessage, getMessages, sendMessage } from "../controllers/messageController.js";
import validateObject from "../middlewares/validateObject.js";
import { verifyToken, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import { isBlock } from "../middlewares/isBlock.js";

const router = new Router()

router.get("/:id", validateObject, verifyToken, isBlock, getMessages);
router.delete("/:id", validateObject, verifyTokenAndOnlyUser, isBlock, deleteConversation);
router.delete("/:messageId", validateObject, verifyTokenAndOnlyUser, isBlock, deleteConversation);
router.post("/send/:id", validateObject, verifyToken, isBlock, sendMessage);

export default router
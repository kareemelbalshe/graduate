import { Router } from "express";
import { chatbot, deleteConversation, deleteMessage, getMessages, sendMessage } from "../controllers/messageController.js";
import validateObject from "../middlewares/validateObject.js";
import { verifyToken, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import { isBlock } from "../middlewares/isBlock.js";

const router = new Router()

router.get("/:id", validateObject, verifyToken, isBlock, getMessages);
router.delete("/:id", validateObject, verifyTokenAndOnlyUser, isBlock, deleteConversation);
router.delete("/:messageId", verifyTokenAndOnlyUser, isBlock, deleteMessage);
router.post("/send/:id", validateObject, verifyToken, isBlock, sendMessage);

// تعريف نقطة النهاية لتلقي البيانات من الشات بوت
router.post('/chatbot_response', chatbot);
  

export default router
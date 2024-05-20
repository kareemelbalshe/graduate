import { Router } from "express";
import { deleteConversation, deleteMessage, getMessages, sendMessage } from "../controllers/messageController.js";
import validateObject from "../middlewares/validateObject.js";
import { verifyToken, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import { isBlock } from "../middlewares/isBlock.js";
import axios from "axios";


const router = new Router()

router.get("/:id", validateObject, verifyToken, isBlock, getMessages);
router.delete("/:id", validateObject, verifyTokenAndOnlyUser, isBlock, deleteConversation);
router.delete("/:messageId", verifyTokenAndOnlyUser, isBlock, deleteMessage);
router.post("/send/:id", validateObject, verifyToken, isBlock, sendMessage);

const FLASK_API_URL = 'http://127.0.0.1:5000'; // تأكد من تحديث هذا المسار بناءً على المسار الفعلي لتطبيق Flask

// تعريف نقطة النهاية لتلقي البيانات من الشات بوت
router.post('/welcome', async (req, res) => {
    try {
        const response = await axios.post(`${FLASK_API_URL}/welcome`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

router.post('/set_disease', async (req, res) => {
    const { disease_input } = req.body;
    try {
        const response = await axios.post(`${FLASK_API_URL}/set_disease`, { disease_input });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

router.post('/set_num_disease', async (req, res) => {
    const { conf_inp } = req.body;
    try {
        const response = await axios.post(`${FLASK_API_URL}/set_num_disease`, { conf_inp });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

router.post('/set_num_days', async (req, res) => {
    const { num_days } = req.body;
    try {
        const response = await axios.post(`${FLASK_API_URL}/set_num_days`, { num_days });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

router.post('/set_y_n', async (req, res) => {
    const { inp } = req.body;
    try {
        const response = await axios.post(`${FLASK_API_URL}/set_y_n`, { inp });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


export default router
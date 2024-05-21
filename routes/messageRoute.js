import { Router } from "express";
import { deleteConversation, deleteMessage, getMessages, sendMessage } from "../controllers/messageController.js";
import validateObject from "../middlewares/validateObject.js";
import { verifyToken, verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import { isBlock } from "../middlewares/isBlock.js";
import axios from "axios";
import ChatBot from "../models/ChatBot.js";

const router = new Router();

// Route to get messages for a specific conversation
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.get("/:id", validateObject, verifyToken, isBlock, getMessages);

// Route to delete a conversation
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.delete("/:id", validateObject, verifyTokenAndOnlyUser, isBlock, deleteConversation);

// Route to delete a message
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.delete("/:messageId", verifyTokenAndOnlyUser, isBlock, deleteMessage);

// Route to send a message
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
router.post("/send/:id", validateObject, verifyToken, isBlock, sendMessage);

const FLASK_API_URL = 'http://127.0.0.1:5000'; // Update this path based on the actual path of the Flask application

// Endpoint definition to receive data from the chatbot
router.post('/welcome', verifyToken, async (req, res) => {
    try {
        await ChatBot.findOneAndDelete({ user: req.user.id });
        const response = await axios.post(`${FLASK_API_URL}/welcome`);
        const data = response.data;
        await ChatBot.create({ user: req.user.id, welcome: data });
        res.json(data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

router.post('/set_disease', verifyToken, async (req, res) => {
    const { disease_input } = req.body;
    await ChatBot.findOneAndUpdate(
        { user: req.user.id },
        {
            $set: {
                disease_input: disease_input
            }
        }
    );

    try {
        const response = await axios.post(`${FLASK_API_URL}/set_disease`, { disease_input });
        const data = response.data;

        await ChatBot.findOneAndUpdate(
            { user: req.user.id },
            {
                $set: {
                    resDisease_input: data
                }
            }
        );
        res.json(data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

router.post('/set_num_disease', verifyToken, async (req, res) => {
    try {
        const { conf_inp } = req.body;
        const chatbot = await ChatBot.findOneAndUpdate({ user: req.user.id }, {
            $set: {
                conf_inp: conf_inp
            }
        })
        const disease_input = chatbot.disease_input
        const response = await axios.post(`${FLASK_API_URL}/set_num_disease`, { disease_input, conf_inp });
        const data = response.data
        await ChatBot.findOneAndUpdate({ user: req.user.id }, {
            $set: {
                resConf_inp: data
            }
        })
        res.json(data)
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

router.post('/set_num_days', verifyToken, async (req, res) => {
    try {
        const { num_days } = req.body;
        const chatbot = await ChatBot.findOneAndUpdate({ user: req.user.id }, {
            $set: {
                num_days: num_days
            }
        })
        const disease_input = chatbot.disease_input
        const conf_inp = chatbot.conf_inp
        const response = await axios.post(`${FLASK_API_URL}/set_num_days`, { disease_input, conf_inp, num_days });
        const data = response.data
        await ChatBot.findOneAndUpdate({ user: req.user.id }, {
            $set: {
                resNum_days: data
            }
        })
        res.json(data)
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

router.post('/set_y_n', verifyToken, async (req, res) => {
    try {
        const { inp } = req.body;
        const chatbot = await ChatBot.findOneAndUpdate({ user: req.user.id }, {
            $set: {
                inp: inp
            }
        })
        const disease_input = chatbot.disease_input
        const conf_inp = chatbot.conf_inp
        const num_days = chatbot.num_days

        const response = await axios.post(`${FLASK_API_URL}/set_y_n`, { disease_input, conf_inp, num_days, inp });
        const data = response.data
        await ChatBot.findOneAndUpdate({ user: req.user.id }, {
            $set: {
                resInp: data
            }
        })
        res.json(data)

    } catch (error) {
        res.status(500).send(error.toString());
    }
});

export default router;

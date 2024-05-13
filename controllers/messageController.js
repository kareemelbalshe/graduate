import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../middlewares/socket.js";
import User from "../models/User.js";
import asyncHandler from "express-async-handler"
// import { exec } from "child_process";
import axios from "axios";


export const sendMessage = asyncHandler(async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user.id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
			await User.findByIdAndUpdate(senderId, {
				$push: {
					ChatList: receiverId
				}
			})
			await User.findByIdAndUpdate(receiverId, {
				$push: {
					ChatList: senderId
				}
			})
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});
		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// SOCKET IO FUNCTIONALITY WILL GO HERE
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

export const getMessages = asyncHandler(async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user.id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;
		const sender = await User.findById(senderId).select("-password -wishlist -ChatList -Reservations")
		const receiver = await User.findById(userToChatId).select("-password -wishlist -ChatList -Reservations")

		res.status(200).json({ sender, receiver, messages });
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

export const deleteMessage = asyncHandler(async (req, res) => {
	await Message.findByIdAndDelete(req.params.messageId)

	res.status(200).json({ message: "message is deleted" });
})

export const deleteConversation = asyncHandler(async (req, res) => {
	const { id: userToChatId } = req.params;
	const senderId = req.user.id;

	await Conversation.findOneAndDelete({
		participants: { $all: [senderId, userToChatId] },
	}) // NOT REFERENCE BUT ACTUAL MESSAGES

	res.status(200).json({ message: "Conversation is deleted" });
})

export const chatbot = asyncHandler(async (req, res) => {

	// البيانات التي ترغب في إرسالها إلى تطبيق Flask

	// إرسال طلب POST إلى تطبيق Flask
	axios.post('http://localhost:5000/predict_symptoms', {
		name: req.body.name,
		disease_input: req.body.disease_input,
		num_days: req.body.num_days,
		syms: req.body.syms
	})
		.then(response => {
			// التعامل مع الرد من تطبيق Flask
			console.log('Prediction:', response.data.prediction);
		})
		.catch(error => {
			console.error('Error:', error);
		});
})
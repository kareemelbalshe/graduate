import Conversation from "../models/Conversation.js";
import Message, { validateMessage } from "../models/Message.js";
import { getReceiverSocketId, io } from "../middlewares/socket.js"; // Importing socket-related functions
import User from "../models/User.js"; // Importing the User model
import asyncHandler from "express-async-handler"; // Importing asyncHandler middleware for handling asynchronous functions
import ChatBot from "../models/ChatBot.js";


// Controller for sending a message
export const sendMessage = asyncHandler(async (req, res) => {
	try {
		const { error } = validateMessage(req.body);
		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}
		const { message } = req.body;
		const { id: receiverId } = req.params; // Extracting receiverId from request parameters
		const senderId = req.user.id; // Extracting senderId from authenticated user

		// Check if conversation already exists between sender and receiver
		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		// If conversation doesn't exist, create a new one
		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});

			// Add receiverId to sender's ChatList and vice versa
			await Promise.all([
				User.findByIdAndUpdate(senderId, { $push: { ChatList: conversation._id } }),
				User.findByIdAndUpdate(receiverId, { $push: { ChatList: conversation._id } })
			]);
		}

		// Create a new message instance
		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		// Add message to conversation
		conversation.messages.push(newMessage._id);

		// Save conversation and message asynchronously
		await Promise.all([conversation.save(), newMessage.save()]);

		// Emit 'newMessage' event to receiver's socket if receiver is online
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		// Respond with the new message
		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Controller for fetching messages between authenticated user and a specific user
export const getMessages = asyncHandler(async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user.id;

		// Find conversation between sender and userToChatId
		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages");

		// If conversation doesn't exist, return empty array
		if (!conversation) return res.status(200).json({ messages: "no conversation found" });

		// Extract messages from conversation and fetch sender and receiver details
		const messages = conversation.messages;
		const sender = await User.findById(senderId).select("-password -wishlist -ChatList -Reservations");
		const receiver = await User.findById(userToChatId).select("-password -wishlist -ChatList -Reservations");

		// Respond with sender, receiver, and messages
		res.status(200).json({ sender, receiver, messages });
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Controller for deleting a message by its ID
export const deleteMessage = asyncHandler(async (req, res) => {
	try {
		const message = await Message.findById(req.params.messageId);
		if (message.senderId.toString() !== req.user.id) {
			return res.status(403).json({ message: "You are not authorized to delete this message" });
		}
		// Find and delete message by its ID
		await Message.findByIdAndDelete(req.params.messageId);

		// Respond with success message
		res.status(200).json({ message: "Message is deleted" });
	} catch (error) {
		console.log("Error in deleteMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Controller for deleting a conversation between authenticated user and a specific user
export const deleteConversation = asyncHandler(async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user.id;

		// Find the conversation between sender and userToChatId
		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		});

		if (!conversation) {
			return res.status(404).json({ message: "Conversation not found" });
		}

		// Remove conversation from user's ChatList
		await User.findByIdAndUpdate(senderId, { $pull: { ChatList: conversation._id } });

		// Emit an event to notify the receiver about the conversation deletion
		const receiverSocketId = getReceiverSocketId(userToChatId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("conversationDeleted", { conversationId: conversation._id, deletedBy: senderId });
		}

		// Respond with success message
		res.status(200).json({ message: "Conversation is deleted from your chat list" });
	} catch (error) {
		console.log("Error in deleteConversation controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

export const get_chatbot = asyncHandler(async (req, res) => {
	try {
		const chatbot = await ChatBot.findOne({ user: req.user.id });
		res.json(chatbot);
	} catch (error) {
		res.status(500).send(error.toString());
	}
});
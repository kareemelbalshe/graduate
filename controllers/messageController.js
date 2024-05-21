import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../middlewares/socket.js"; // Importing socket-related functions
import User from "../models/User.js"; // Importing the User model
import asyncHandler from "express-async-handler"; // Importing asyncHandler middleware for handling asynchronous functions


// Controller for sending a message
export const sendMessage = asyncHandler(async (req, res) => {
	try {
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
			await User.findByIdAndUpdate(senderId, {
				$push: {
					ChatList: receiverId
				}
			});
			await User.findByIdAndUpdate(receiverId, {
				$push: {
					ChatList: senderId
				}
			});
		}

		// Create a new message instance
		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		// Add message to conversation
		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

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
		if (!conversation) return res.status(200).json([]);

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
	// Find and delete message by its ID
	await Message.findByIdAndDelete(req.params.messageId);

	// Respond with success message
	res.status(200).json({ message: "Message is deleted" });
});

// Controller for deleting a conversation between authenticated user and a specific user
export const deleteConversation = asyncHandler(async (req, res) => {
	const { id: userToChatId } = req.params;
	const senderId = req.user.id;

	// Find and delete conversation between sender and userToChatId
	await Conversation.findOneAndDelete({
		participants: { $all: [senderId, userToChatId] },
	});

	// Respond with success message
	res.status(200).json({ message: "Conversation is deleted" });
});

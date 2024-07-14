import mongoose from 'mongoose';
import Joi from 'joi';

// Define the message schema
const messageSchema = new mongoose.Schema(
	{
		// Reference to the sender user ID
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		// Reference to the receiver user ID
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		// The content of the message
		message: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		// Enable timestamps to automatically add createdAt and updatedAt fields
		timestamps: true,
		// Configure JSON serialization to include virtual properties
		toJSON: { virtuals: true },
		// Configure object serialization to include virtual properties
		toObject: { virtuals: true }
	}
);

// Validation function using Joi
export const validateMessage = function (obj) {
	const schema = Joi.object({
		message: Joi.string().trim().required(),
	});
	return schema.validate(obj);
};

// Create a Mongoose model based on the message schema
const Message = mongoose.model('Message', messageSchema);

export default Message;

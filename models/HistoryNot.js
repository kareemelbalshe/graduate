import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["history_request", "history_response"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    history: {
        type: Schema.Types.ObjectId,
        ref: "History",
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

export default model('Notification', NotificationSchema);

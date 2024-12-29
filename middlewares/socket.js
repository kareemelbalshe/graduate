import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express(); // Initialize Express app

const server = http.createServer(app); // Create HTTP server
const io = new Server(server);

const userSocketMap = {}; // Map to store user IDs and their corresponding socket IDs

// Function to get the socket ID of a receiver by their user ID
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

// Handle new socket connections
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // Get user ID from the socket handshake query
    const userId = socket.handshake.query.userId;
    if (userId !== undefined) {
        userSocketMap[userId] = socket.id; // Map user ID to socket ID

        // Emit the list of online users to all connected clients
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // Handle socket disconnection
        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
            delete userSocketMap[userId]; // Remove user from the map
            io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated list of online users
        });
    }
});

export { app, io, server }; // Export app, io, and server for use in other modules

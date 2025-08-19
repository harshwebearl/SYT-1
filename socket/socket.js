const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5000",
      "http://localhost:5173",
      "http://3.108.65.195:4000",
      "https://start-your-tour-cb6k.onrender.com"
    ],
    methods: ["GET", "POST"]
  }
});

// { userId: socketId }
const userSocketMap = {};

// Utility to fetch a user's socketId
const getReceiverSocketId = (receiverId) => {
  const receiverKey = receiverId?.toString(); // always string
  const socketId = userSocketMap[receiverKey];
  console.log(`Fetching socketId for user ${receiverKey}:`, socketId);
  return socketId;
};

io.on("connection", (socket) => {
  console.log("✅ New socket connected:", socket.id);

  // Read userId from query
  const userId = socket.handshake.query.userId;
  console.log("UserId from query:", userId);

  if (userId && userId !== "undefined") {
    userSocketMap[userId.toString()] = socket.id;
    console.log("Updated userSocketMap:", userSocketMap);
  } else {
    console.log("⚠️ Invalid UserId received from socket:", socket.id);
  }

  // Notify all clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);

    // Remove the user from the map
    if (userId && userSocketMap[userId.toString()]) {
      delete userSocketMap[userId.toString()];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { app, io, server, getReceiverSocketId };

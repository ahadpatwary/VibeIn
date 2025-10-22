import express from "express";
import http from "http";
import { Server } from "socket.io";
import Message from "./models/Message"; // ✅ relative path ঠিক করো
import { connectToDb } from "./lib/db"; // ✅ relative path ঠিক করো
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://vibe-in-teal.vercel.app"], // ✅ specific origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ MongoDB Connect (IIFE async)
(async () => {
  try {
    await connectToDb();
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
})();

// ✅ Active users list (userId -> socketId)
const activeUsers: Record<string, string> = {};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // ✅ User join event
  socket.on("addUser", (userId: string) => {
    activeUsers[userId] = socket.id;
    io.emit("getUsers", Object.keys(activeUsers));
  });

  // ✅ Message send event
  socket.on(
    "sendMessage",
    async ({
      sender,
      receiver,
      text,
    }: {
      sender: string;
      receiver: string;
      text: string;
    }) => {
      try {
        console.log("💬 Message received from:", sender);

        // ✅ Save message to MongoDB
        const message = await Message.create({ sender, receiver, text });
        console.log("✅ Message saved:", message);

        // ✅ Send message to receiver if online
        const receiverSocket = activeUsers[receiver];
        if (receiverSocket) {
          io.to(receiverSocket).emit("getMessage", message);
        }
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }
    }
  );

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    for (let userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
        break;
      }
    }
    io.emit("getUsers", Object.keys(activeUsers));
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ✅ Simple route for testing
app.get("/", (req, res) => {
  res.send("Socket server is running 🚀");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
});
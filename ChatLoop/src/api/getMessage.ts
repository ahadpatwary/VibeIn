import express from "express";
import Message from "../models/Message";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, chatWith } = req.body;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: chatWith },
        { sender: chatWith, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", (error as Error).message);
    return res.status(500).json({ messages: null });
  }
});

export default router;
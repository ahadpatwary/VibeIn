import express from "express";
import { Types } from "mongoose";
import Conversation from "../models/Conversation";
import User from "../models/UserLite"; // ✅ import dummy model

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userID } = req.body;

    if (!userID) return res.status(400).json({ message: "userID missing" });

    const data = await User.findById(new Types.ObjectId(userID));
    console.log(data);

    const conversations = await Conversation.find({
      $or: [
        { senderId: new Types.ObjectId(userID) },
        { receiverId: new Types.ObjectId(userID) },
      ],
    })
      .populate("receiverId", "_id name picture") // ✅ safe populate
      .populate("senderId", "_id name picture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
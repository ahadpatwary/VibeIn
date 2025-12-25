import express, { Request, Response } from "express";
import { Types } from "mongoose";
import Conversation from "../models/Conversations";
import User from "../models/UserLite"; // ✅ import dummy model
import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  type: 'oneToOne' | 'group';

  participants: Types.ObjectId[];
  deletedBy: Types.ObjectId[];
  blockedUser: Types.ObjectId[];
  requestUser: Types.ObjectId[];

  lastMessage?: Types.ObjectId;

  extraFields?: {
    groupName?: string;
    groupPicture?: {
      public_id: string;
      url: string;
    };
    groupBio?: string;
    groupAdmin?: Types.ObjectId;
  };
}

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userID } = req.body;

    if (!userID) return res.status(400).json({ message: "userID missing" });

    await User.findById(userID);

    const result = await Conversation.find({
      participants: { $in: [new Types.ObjectId(userID)] },
    })
    .sort({ lastMessage: -1 })
    .lean();

    
    const conversations = await Promise.all(
      result.map(async (conv) => {

        if (conv.type === "group") {
          return {
            ...conv,

            info: {
              name: conv.extraFields?.groupName,
              picture: conv.extraFields?.groupPicture,
              bio: conv.extraFields?.groupBio,
              admin: conv.extraFields?.groupAdmin,
            },
          };
        }

        // oneToOne
        const otherPersonId = conv.participants.find(
          (id: any) => id.toString() !== userID
        );

        const otherUser = await User.findById(otherPersonId)
          .select("name picture")
          .lean();

        return {
          ...conv,

          info: otherUser,
        };
      })
    );

    return res.status(200).json({ conversations });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
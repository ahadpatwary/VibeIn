import express, { Request, Response } from "express";
import { Types } from "mongoose";
import { Document } from 'mongoose';
import { getRedisClient } from "../lib/redis";

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
    const redis = getRedisClient();

    if (!userID || !redis) return res.status(400).json({ message: "userID missing" });

    const conversationIds = await redis.zrevrange(
      `user:${userID}:conversations`,
      0,
      -1
    );

    const pipeline = redis.pipeline();

    conversationIds.forEach((convId: string) => {
      pipeline.hgetall(`conversation:${convId}`);
    });

    const results = await pipeline.exec();

    const conversations = results && results
      .map(([err, data], index) => {
        if (err || !data || Object.keys(data).length === 0) return null;

        return {
          conversationId: conversationIds[index],
          ...data
        };
      })
      .filter(Boolean);


    return res.status(200).json({ conversations });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
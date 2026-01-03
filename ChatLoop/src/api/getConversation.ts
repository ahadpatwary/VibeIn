import express, { Request, Response } from "express";
import { Types } from "mongoose";
import { Document } from 'mongoose';
import { getRedisClient } from "../lib/redis";
import Conversation from "../models/Conversations";

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

interface convType {
  conversationId: string,
  name: string,
  picture: string,
}
interface RedisUser {
  _id: string;
  name: string;
  picture: string,
}

function isConversation(data: any): data is convType {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.conversationId === 'string' &&
    typeof data.name === 'string' &&
    typeof data.picture === 'string'
  );
}

function isRedisUser(data: any): data is RedisUser {
  return (
    data &&
    typeof data === 'object' &&
    typeof data._id === 'string' &&
    typeof data.name === 'string' &&
    data.picture
  );
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

    const conversations: convType[]  = (results || [])
      ?.map(([err, data], index) => {
        if (err || !data || Object.keys(data).length === 0) return null;

        return {
          conversationId: conversationIds[index],
          ...data
        };
      })
      .filter(isConversation);


      const conversationIdSet = new Set<string>();

    conversations?.forEach(msg => {
      conversationIdSet?.add(msg?.conversationId!);
    });

    const convIds = Array.from(conversationIdSet);

    console.log("convId", convIds);

    const conversationPipeline = redis.pipeline();

    convIds.forEach(id => {
      conversationPipeline.hgetall(`conversation:${id}:info`);
    });

    const userResults = await conversationPipeline.exec();

    const conversationMap: Record<string, {_id: string, name: string, picture: string}> = {};
    const missingConversationIds: string[] = [];

    userResults?.forEach(([err, data], index) => {
      const convId = convIds[index];

      if (!err && isRedisUser(convId)) {
        conversationMap[convId] = data as {_id: string, name: string, picture: string};
      } else {
        missingConversationIds.push(convId);
      }
    });



    const validObjectIds = missingConversationIds.filter(id =>
      Types.ObjectId.isValid(id)
    );

    if (validObjectIds.length > 0) {
        const conversationsFromDB = await Conversation.find({
            _id: { $in: validObjectIds }
        })
        .populate('participants', '_id name picture')
        .lean()

        console.log("hidksfj", conversationsFromDB);
        let redisConversation;

        conversationsFromDB.forEach((conversation: any) => {

          conversation?.type === 'oneToOne' ? (
            redisConversation = {
              _id: conversation._id,
              name : userID == conversation.participants[0]._id ? conversation.participants[1].name : conversation.participants[1].name,
              picture: userID == conversation.participants[1]._id ? conversation.participants[0].picture.url : conversation.participants[1].picture.url,
            }
          ) : (
            redisConversation = {
              _id: conversation._id,
              name : conversation.extraFields.groupName,
              picture: conversation.extraFields.groupPicture.url,
            }
          );

            conversationMap[redisConversation._id] = redisConversation;

            redis.hset(`conversation:${redisConversation._id}:info`, redisConversation);
            redis.expire(`conversation:${redisConversation._id}`, 60 * 60);
        });
    }


    const populatedConversations = conversations.map(conversation => ({
      ...conversation,
      name: conversationMap[conversation.conversationId!]?.name as string,
      picture: conversationMap[conversation.conversationId!]?.picture as string,
    }));


    return res.status(200).json({ conversations: populatedConversations });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getRedisClient } from '../lib/redis';
import User from '../models/UserLite';

const router = express.Router();

/* =======================
   Interfaces
======================= */

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  referenceMessage: string | null;
  messageTime: number;
}

interface RedisUser {
  _id: string;
  name: string;
  picture: {
    url: string;
    public_id: string;
  };
}

/* =======================
   Type Guards
======================= */

function isMessage(data: any): data is Message {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.senderId === 'string' &&
    typeof data.receiverId === 'string' &&
    typeof data.text === 'string'
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

/* =======================
   Route
======================= */

router.post('/', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.body;
    const redis = getRedisClient();

    if (!groupId || !redis) {
      return res.status(400).json({ message: 'groupId and redis are required' });
    }

    /* =======================
       1️⃣ Get message IDs
    ======================= */

    const messageIds = await redis.zrevrange(
      `conversation:${groupId}:messages`,
      0,
      -1
    );

    const messagePipeline = redis.pipeline();

    messageIds.forEach((msgId: string) => {
      messagePipeline.hgetall(`message:${msgId}`);
    });

    const messageResults = await messagePipeline.exec();

    /* =======================
       2️⃣ Clean messages
    ======================= */

    const messages: Message[] = (messageResults || [])
      .map(([err, data]) => {
        if (err || !data || Object.keys(data).length === 0) return null;
        return data;
      })
      .filter(isMessage);

    /* =======================
       3️⃣ Collect user IDs
    ======================= */

    const userIdSet = new Set<string>();

    messages.forEach(msg => {
      userIdSet.add(msg.senderId);
      userIdSet.add(msg.receiverId);
    });

    const userIds = Array.from(userIdSet);

    /* =======================
       4️⃣ Fetch users from Redis
    ======================= */

    const userPipeline = redis.pipeline();

    userIds.forEach(id => {
      userPipeline.hgetall(`user:${id}`);
    });

    const userResults = await userPipeline.exec();

    const userMap: Record<string, RedisUser> = {};
    const missingUserIds: string[] = [];

    userResults?.forEach(([err, data], index) => {
      const userId = userIds[index];

      if (!err && isRedisUser(data)) {
        userMap[userId] = data;
      } else {
        missingUserIds.push(userId);
      }
    });

    /* =======================
       5️⃣ DB fallback + cache
    ======================= */

    if (missingUserIds.length > 0) {
      const usersFromDB = await User.find({
        _id: { $in: missingUserIds.map(id => new Types.ObjectId(id)) }
      }).lean();

      usersFromDB.forEach((user: any) => {
        const redisUser: RedisUser = {
          _id: user._id.toString(),
          name: user.name,
          picture: user.picture,
        };

        userMap[redisUser._id] = redisUser;

        redis.hset(`user:${redisUser._id}`, redisUser);
        redis.expire(`user:${redisUser._id}`, 60 * 60); // 1 hour
      });
    }

    /* =======================
       6️⃣ Populate messages
    ======================= */

    const populatedMessages = messages.map(msg => ({
      ...msg,
      sender: userMap[msg.senderId] ?? null,
      receiver: userMap[msg.receiverId] ?? null,
    }));

    return res.status(200).json({ messages: populatedMessages });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'internal server error' });
  }
});

export default router;

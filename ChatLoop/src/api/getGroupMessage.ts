import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getRedisClient } from '../lib/redis';
import User from '../models/UserLite';

const router = express.Router();


interface Message {
  _id: string;
  senderId: string;
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


function isMessage(data: any): data is Message {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.senderId === 'string' &&
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


router.post('/', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.body;
    const redis = getRedisClient();

    if (!groupId || !redis) {
      return res.status(400).json({ message: 'groupId and redis are required' });
    }


    const messageIds = await redis.zrange(
      `conversation:${groupId}:messages`,
      0,
      -1
    );

    const messagePipeline = redis.pipeline();

    messageIds.forEach((msgId: string) => {
      messagePipeline.hgetall(`message:${msgId}`);
    });

    const messageResults = await messagePipeline.exec();


    console.log("messRes", messageResults);

    const messages: Message[] = (messageResults || [])
      .map(([err, data]) => {
        if (err || !data || Object.keys(data).length === 0) return null;
        return data;
      })
      .filter(isMessage);



    const userIdSet = new Set<string>();

    messages.forEach(msg => {
      userIdSet.add(msg.senderId);
    });

    const userIds = Array.from(userIdSet);


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



    const validObjectIds = missingUserIds.filter(id =>
        Types.ObjectId.isValid(id)
    );

    if (validObjectIds.length > 0) {
        const usersFromDB = await User.find({
            _id: { $in: validObjectIds }
        }).lean();

        usersFromDB.forEach((user: any) => {
            const redisUser = {
                _id: user._id.toString(),
                name: user.name,
                picture: user.picture.url,
            };

            userMap[redisUser._id] = redisUser;

            redis.hset(`user:${redisUser._id}`, redisUser);
            redis.expire(`user:${redisUser._id}`, 60 * 60);
        });
    }


    const populatedMessages = messages.map(msg => ({
      ...msg,
      picture: userMap[msg.senderId].picture ?? null,
    }));

    return res.status(200).json({ messages: populatedMessages });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'internal server error' });
  }
});

export default router;
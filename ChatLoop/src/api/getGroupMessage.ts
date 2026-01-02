import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupMessage from '../models/GroupMessage';
import { getRedisClient } from '../lib/redis';
import User from '../models/UserLite';

interface propType{
    senderId: string,
    receiverId: string,
}

interface messagePropType {
  _id: string,
  senderId: string,
  receiverId: string,
  text: string,
  referenceMessage: string | null,
  messageTime: number,
}

interface userPropType {
    _id: string,
    name: string;
    picture: {
        url: string;
        public_id: string;
    };
}

const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { groupId } = req.body;
        const redis = getRedisClient();

        if(!groupId || !redis)
            return res.status(400).json({ message: 'groupId and redis must be required' })
        ;

        // const messages = await groupMessage.find(
        // { groupId: new Types.ObjectId(groupId) }
        // )
        // .populate('senderId', '_id name picture')
        // .populate({
        // path: 'referenceMessage',       // ১ম populate referenceMessage
        // populate: {                     // তার ভেতরে nested populate
        //     path: 'senderId',             // referenceMessage এর ভেতরের senderId
        //     select: 'name picture'    // যে ফিল্ডগুলো নিতে চাও
        // }
        // });

        const messageIds = await redis.zrevrange(
            `conversation:${groupId}:messages`,
            0,
            -1
        );

        const pipeline = redis.pipeline();

        messageIds.forEach((msgId: string) => {
            pipeline.hgetall(`message:${msgId}`,);
        });

        const results = await pipeline.exec();

        const messages = results && results
            .map(([err, data]) => {
                if (err || !data || Object.keys(data).length === 0) return null;

                return { ...data };
            })
            .filter(Boolean)
        ;
        
        const userIds = new Set<string>();

        messages.forEach((msg: propType) => {
            if (msg.senderId) userIds.add(msg.senderId);
            if (msg.receiverId) userIds.add(msg.receiverId);
        });

        const uniqueUserIds = [...userIds];


        const userPipeline = redis.pipeline();

        uniqueUserIds.forEach(id => {
            userPipeline.hgetall(`user:${id}`);
        });

        const userResults = await userPipeline.exec();


        const userMap: any = {};
        const missingUserIds: string[] = [];

        userResults.forEach(([err, data], index) => {
            const userId = uniqueUserIds[index];

            if (!err && data && Object.keys(data).length > 0) {
                userMap[userId] = data;
            } else {
                missingUserIds.push(userId);
            }
        });


        if (missingUserIds.length > 0) {
            const usersFromDB = await User.find({
                _id: { $in: missingUserIds }
            }).lean();

            usersFromDB.forEach((user: userPropType) => {
                userMap[user._id] = user;

                // cache in Redis
                redis.hset(`user:${user._id}`, {
                    _id: user._id.toString(),
                    name: user.name,
                    picture: user.picture
                });
                redis.expire(`user:${user._id}`, 60 * 60); // 1 hour
            });
        }

        const populatedMessages = messages.map((msg: messagePropType) => ({
            ...msg,
            senderId: userMap[msg.senderId] || null,
            receiverId: userMap[msg.receiverId] || null,
        }));


        return res.status(200).json({messages: populatedMessages});

    } catch (error) {
        return res.status(500).json({ message: "internal server error" });
    }
})

export default router;
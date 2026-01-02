import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupMessage from '../models/GroupMessage';
import { getRedisClient } from '../lib/redis';


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
            .filter(Boolean);
                    

        return res.status(200).json({messages});

    } catch (error) {
        return res.status(500).json({ message: "internal server error" });
    }
})

export default router;
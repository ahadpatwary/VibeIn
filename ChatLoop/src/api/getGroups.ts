import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import groupConversation from '../models/GroupConversation';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId)
            return res.status(400).json({ message: 'userId and groupId are required' })
        ;

        const groups = await groupConversation.find(
            {
                $and: [
                    { participants: { $in: [ new Types.ObjectId(userId) ]}},
                    { deletedBy: { $nin: [new Types.ObjectId(userId)]}}
                ]
            }
        );

        return res.status(200).json({ groups });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
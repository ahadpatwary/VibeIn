import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import Conversation from '../models/Conversations';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { userId, groupId } = req.body;

        if (!userId || !groupId)
        return res.status(400).json({ message: 'userId and groupId must be required' });

        const userObjectId = new Types.ObjectId(userId);

        const data = await Conversation.findByIdAndUpdate(
            groupId, 
            {
                $push: { blockedUser: userObjectId },
                $pull: { participants: userObjectId } 
            }, 
            { new: true } 
        );

        if (!data)
        return res.status(404).json({ message: 'Group not found' });

        return res.status(200).json({
            message: 'User blocked successfully',
            data,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
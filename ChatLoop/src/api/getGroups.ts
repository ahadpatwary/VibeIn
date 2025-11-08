import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import groupConversation from '../models/GroupConversation';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { userId, groupId } = req.body;

        if (!userId || !groupId)
        return res.status(400).json({ message: 'userId and groupId are required' });

        const group = await groupConversation.find({
            _id: new Types.ObjectId(groupId),
            deletedBy: { $nin: [new Types.ObjectId(userId)] } // এখানে check হচ্ছে userId deletedBy array তে নেই
        });

        return res.status(200).json({ group });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
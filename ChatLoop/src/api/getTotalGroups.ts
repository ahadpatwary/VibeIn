import express, { Request, Response } from 'express';
import Conversation from '../models/Conversations';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const groups = await Conversation.find({ type: 'group' })
            .select('_id extraFields')
            .lean()
            .exec();

        return res.status(200).json({ groups });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
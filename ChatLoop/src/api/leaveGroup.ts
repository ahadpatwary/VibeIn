import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupConversation from '../models/GroupConversation';


const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { userId, groupId } = req.body;

        if(!userId || !groupId)
            res.status(400).json({ message: 'userId and groupId must be required' })
        ;

        const data = await groupConversation.findByIdAndUpdate(
            groupId,
            {$pull: { participants: new Types.ObjectId(userId) }}
        )

        if(!data)
            res.status(400).json({ message: 'group not found' })
        ;

        res.status(200).json({ message: 'you leave successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
})

export default router;
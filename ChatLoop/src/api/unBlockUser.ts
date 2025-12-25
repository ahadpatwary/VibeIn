import express, {Request, Response} from 'express'
import { Types } from 'mongoose'
import Conversation from '../models/Conversations';

const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {

        const { userId, groupId } = req.body;

        if(!userId || !groupId)
            return res.status(400).json({ message: 'userId and groupId must be required' })
        ;

        const data = await Conversation.findByIdAndUpdate(
            groupId,
            {$pull: {blockedUser: new Types.ObjectId(userId)}}
        )

        if(!data)
            return res.status(400).json({ message: 'group not found' })
        ;

        return res.status(200).json({ message: 'unblock user successfully' });

    } catch (error) {
        if(error instanceof Error)
            return res.status(400).json({ message: error.message})
        ;
    }
})

export default router;
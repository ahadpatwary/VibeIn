import express, { Request, Response } from 'express'
import groupConversation from '../models/GroupConversation';


const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const {userId, groupId} = req.body;
        
        if(!userId || !groupId)
            return res.status(400).json({ message: 'userId and groupId must be required' })
        ;

        const data = await groupConversation.findByIdAndUpdate(
            groupId,
            {$push: {participants: userId}}
        );

        if(!data)
            return res.status(400).json({ message: 'group not find' })
        ;

        return res.status(200).json({ message: 'request accept successfully' });

    } catch (error) {
        if(error instanceof Error)
            return res.status(500).json({ message: error.message })
        ;
    }
})

export default router;
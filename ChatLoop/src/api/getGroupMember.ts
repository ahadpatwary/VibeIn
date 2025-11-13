import express, { Request, Response } from 'express'
import groupConversation from '../models/GroupConversation';


const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { groupId } = req.body;
        
        if(!groupId)
            return  res.status(400).json({ message: 'groupId must be required' })
        ;
        const { participants } = await groupConversation
            .findById(groupId)
            .select('participants')
            .populate('participants', '_id name picture')
            .lean()
        ; // object হিসেবে পাবে

        return res.status(200).json({ members: participants });

    } catch (error) {
        if(error instanceof Error)
            return res.status(500).json({ message: error.message })
        ;
    }
})

export default router;
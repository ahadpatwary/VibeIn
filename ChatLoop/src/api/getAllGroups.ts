import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupConversation from '../models/GroupConversation';  // eita ektu dekho


//need userId and groupId
const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { userId } = req.body;

        if(!userId ) 
            return res.status(400).json({ message: 'userId and groupId mest be required'})
        ;


        const data = await groupConversation.find(
            { participants: { $in: [ new Types.ObjectId(userId) ]}}
        )

        if (!data || data.length === 0)
            return res.status(404).json({ message: 'No groups found for this user' })
        ;

        return res.status(200).json({ message: data});

    } catch (error) {
        return res.status(500).json({ message: 'internal server Error' });
    }
})

export default router;
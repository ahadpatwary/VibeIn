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


        const groups = await groupConversation.find(
            { participants: { $in: [ new Types.ObjectId(userId) ]}}
        )

        return res.status(200).json({ groups });

    } catch (error) {
        return res.status(500).json({ message: 'internal server Error' });
    }
})

export default router;
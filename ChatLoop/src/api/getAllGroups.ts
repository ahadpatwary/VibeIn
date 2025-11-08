import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupConversation from '../models/GroupConversation';  // eita ektu dekho
import User from '../models/UserLite';

//need userId and groupId
const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { userId, groupId } = req.body;

        if(!userId || !groupId) 
            return res.status(400).json({ message: 'userId and groupId mest be required'});

        const data = await User
            .find({ _id : new Types.ObjectId(userId)})
            .populate('groupConversation', 'groupName groupPicture lastMessage')
        ;

        if (!data || data.length === 0)
            return res.status(404).json({ message: 'No groups found for this user' })
        ;

        return res.status(200).json({ message: data});

    } catch (error) {
        return res.status(500).json({ message: 'internal server Error' });
    }
})

export default router;
import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import Conversation from '../models/Conversations';

//need user Id and groupId

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {

        const { userId } = req.body;

        if(!userId ) 
            return res.status(400).json({ message: 'userId must be required' })
        ;

        const request = await Conversation.find(
            {
                requestUser: {$in: [new Types.ObjectId(userId)]}
            }
        );

        if(!request)
            return res.status(400).json({ message: "groupId not find" });
        ;

        return res.status(200).json({ request });            

    } catch (error) {
        return res.status(500).json({ message: "internal server error"});
    }
})

export default router;
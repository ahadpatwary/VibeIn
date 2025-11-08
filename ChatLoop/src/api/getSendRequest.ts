import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupConversation from '../models/GroupConversation';


//need user Id and groupId

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {

        const { userId, groupId } = req.body;

        if(!userId || !groupId) 
            return res.status(400).json({ message: 'userId and groupId must be required' })
        ;

        const data = await groupConversation.findByIdAndUpdate(
            groupId,
            {$push: { requestUser : new Types.ObjectId(userId)}},
            {new: true}
        )

        if(!data)
            return res.status(400).json({ message: "groupId not find" });
        ;

        return res.status(200).json({ message: 'request send successfully' });            

    } catch (error) {
        return res.status(500).json({ message: "internal server error"});
    }
})

export default router;
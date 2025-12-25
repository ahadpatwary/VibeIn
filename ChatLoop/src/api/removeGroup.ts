import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupMessage from '../models/GroupMessage';
import Conversation from '../models/Conversations';


const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { userId, groupId } = req.body;

        if(!userId || !groupId)
            return res.status(400).json({ message: 'userId and groupId must be required' })
        ;

        const isAdmin = await Conversation.exists({
            _id: groupId,
            extraFields: { groupAdmin: userId }
        });

        if(isAdmin){
            await groupMessage.deleteMany(
                { groupId: new Types.ObjectId(groupId) }
            )
            await Conversation.findByIdAndDelete(groupId);

            return res.status(200).json({ message: "group delete successfully" });
        }

        await Conversation.findByIdAndUpdate(
            groupId,
            { $push: { deletedBy: userId }}
        )

        return res.status(200).json({ message: "conversation delete successfully" });

    } catch (error) {
        return res.status(500).json({ message: 'interval server error' });
    }
})

export default router;
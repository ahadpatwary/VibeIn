import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupConversation from '../models/GroupConversation';
import groupMessage from '../models/GroupMessage';



const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { userId, groupId } = req.body;

        if(!userId || !groupId)
            return res.status(400).json({ message: 'userId and groupId must be required' })
        ;

        const isAdmin = await groupConversation.exists({
            _id: groupId,
            groupAdmin: userId,
        });

        if(isAdmin){
            await groupMessage.deleteMany(
                { groupId: new Types.ObjectId(groupId) }
            )
            await groupConversation.findByIdAndDelete(groupId);

            return res.status(200).json({ message: "group delete successfully" });
        }

        await groupConversation.findByIdAndUpdate(
            groupId,
            { $push: { deletedBy: userId }}
        )

        return res.status(200).json({ message: "conversation delete successfully" });

    } catch (error) {
        return res.status(500).json({ message: 'interval server error' });
    }
})

export default router;
import express, { Request, Response } from 'express'
import { Types } from 'mongoose'
import groupMessage from '../models/GroupMessage';


const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { groupId } = req.body;

        if(!groupId)
            return res.status(400).json({ message: 'groupId must be required' })
        ;

        const messages = await groupMessage.find(
            { groupId: new Types.ObjectId(groupId) }
        )

        return res.status(200).json({messages});

    } catch (error) {
        return res.status(500).json({ message: "internal server error" });
    }
})

export default router;
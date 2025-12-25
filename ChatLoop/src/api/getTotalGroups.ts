import express, { Request, Response } from 'express'
import Conversation from '../models/Conversations';

//need userId and groupId
const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { userId } = req.body;

        if(!userId ) 
            return res.status(400).json({ message: 'userId and groupId mest be required'})
        ;


        const groups = await Conversation.find()

        return res.status(200).json({ groups });

    } catch (error) {
        return res.status(500).json({ message: 'internal server Error' });
    }
})

export default router;
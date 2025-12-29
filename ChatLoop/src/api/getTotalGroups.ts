import express, {  Response } from 'express'
import Conversation from '../models/Conversations';

//need userId and groupId
const router = express.Router();

router.post('/', async( res: Response) => {
    try {
    
        const groups = await Conversation.find({ type: 'group' })
            .select('_id extraFields')
            .lean()
            .exec();

        return res.status(200).json({ groups });

    } catch (error) {
        return res.status(500).json({ message: 'internal server Error' });
    }
})

export default router;
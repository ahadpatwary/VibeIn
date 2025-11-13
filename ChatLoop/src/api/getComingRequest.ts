import express, { Request, Response } from 'express'
import groupConversation from '../models/GroupConversation';


// need groupId
const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        
        const { groupId } = req.body;

        if(!groupId)
            return res.status(400).json({ message: 'groupId is required' })
        ;

        const request = await groupConversation
            .findById(groupId)
            .select('reqestUser')
            .populate('requestUser', '_id name picture')
        ;

        if(!request)
            return res.status(400).json({ message: 'group not found'});
        ;

        return res.status(200).json({ request });
            
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
})

export default router;
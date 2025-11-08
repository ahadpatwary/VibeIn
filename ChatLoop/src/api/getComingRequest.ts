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

        const data = await groupConversation
            .findById(groupId)
            .populate('requestUser', 'name picture')
        ;

        if(!data)
            return res.status(400).json({ message: 'group not found'});
        ;

        return res.status(200).json({ message: data});
            
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
})

export default router;
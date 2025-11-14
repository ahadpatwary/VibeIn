import express, { Request, Response } from 'express'
import groupConversation from '../models/GroupConversation';


const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        
        const { groupId } = req.body;

        if( !groupId)
            return res.status(400).json({ message: 'userId and groupId must be required' })
        ;

        const blockUser = await groupConversation
            .findById(groupId)
            .select('blockedUser')
            .populate('blockedUser', '_id name picture')
        ;

        if(!blockUser)
            return res.status(400).json( { message: 'group not found' })
        ;

        return res.status(200).json({blockUser});

    } catch (error) {
        if(error instanceof Error)
            return res.status(500).json({ massage: error.message})
        ;
    }
})

export default router;
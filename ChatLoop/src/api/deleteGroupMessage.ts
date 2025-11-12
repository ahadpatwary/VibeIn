import express, { Request, Response } from 'express'
import groupMessage from '../models/GroupMessage';


const router = express.Router();


router.delete('/', async(req: Request, res: Response) => {
    try {
        
        const { messageId } = req.body;
        if(!messageId) 
            return res.status(400).json({ message: 'messageId must be required' })
        ;

        const data = await groupMessage.findByIdAndDelete(messageId);

        if(!data)
            return res.status(400).json({ message: 'messageId not found' })
        ;

        return res.status(200).json({ message: "message Deleted successfully" });

    } catch (error) {
        if(error instanceof Error)
            return res.status(500).json({ message: error.message })
        ;
    }
})

export default router;
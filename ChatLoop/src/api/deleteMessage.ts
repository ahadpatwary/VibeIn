import express, { Request, Response } from 'express'
import Message from '../models/Message';


const router = express.Router();

router.delete('/', async(req: Request, res: Response) => {
    try {
        
        const { messageId } = req.body;
        
        if(!messageId)
            return res.status(400).json({ message : 'message Id must be required '})
        ;

        const data = await Message.findByIdAndDelete(messageId);
        
        if(!data)
            return res.status(400).json({ message: 'message id not found' })
        ;

        return res.status(200).json({ message: 'message deleted successfully' });

    } catch (error) {
        if(error instanceof Error)
            return res.status(500).json({ message: error.message })
        ;
    }
})

export default router;
import express, { Request, Response } from 'express';
import Conversation from '../models/Conversations';


const router = express.Router();


router.post('/', async(req: Request, res: Response) => {
    try {
        const { userId, chatWith } = req.body;

        if(!userId || !chatWith)
            return res.status(400).json({ message: "userId and chatWith must be required"})
        ;

        const data = await Conversation.findOne({
            participants: { $all: [userId, chatWith] },
            type: 'oneToOne'
        })
        .populate('participants', '_id name picture');


        if(!data){
            return res.status(200).json({ message: null});
        }

        return res.status(200).json({ message: data });
        
    } catch (error) {
        if(error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
    }
})

export default router;
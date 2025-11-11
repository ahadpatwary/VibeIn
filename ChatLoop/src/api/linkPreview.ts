import express, { Request, Response } from 'express'
import ogs from "open-graph-scraper";

const router = express.Router();

router.post('/', async(req: Request, res: Response) => {
    try {
        
        const { url } = req.body;
        
        if(!url) 
            return res.status(400).json({ message: "url must be required" })
        ;

        const result = await ogs({ url });

        if(!result)
            return res.status(400).json( {message: "no data find" })
        ;

        return res.status(200).json({ result });

    } catch (error) {
        if(error instanceof Error)
            return res.status(400).json({ message: error.message})
        ;
    }
})

export default router;
import express from 'express'
import Conversation from '../models/Conversation';

const router = express.Router();

// GET route
router.get('/', async (req, res) => {
    try {

        const conversations = await Conversation.find().sort({ createdAt: -1 });

        return res.status(200).json({ conversations });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
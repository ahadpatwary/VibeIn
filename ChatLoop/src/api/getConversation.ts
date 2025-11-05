import express from 'express'
import Conversation from '../models/Conversation';
import { Types } from 'mongoose'


const router = express.Router();

// GET route
router.post('/', async (req, res) => {
    try {

        const { userID } = req.body;

        console.log("suserId", userID);

        const conversations = await Conversation.find({
            $or: [
                { senderId: userID },
                { receiverId: new Types.ObjectId(userID) },
            ],
        })
        .populate("receiverId", "name picture")
        .sort({ createdAt: -1 });

        console.log("Sconv:", conversations);

        return res.status(200).json({ conversations });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
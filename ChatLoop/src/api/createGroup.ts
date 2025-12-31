import express, { Request, Response } from 'express';
import { upload } from '../middlewares/multer';
import cloudinary from '../lib/cloudinary';
import { Types } from 'mongoose';
import Conversation from '../models/Conversations';
import { getRedisClient } from '../lib/redis';

const router = express.Router();

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
    try {

        console.log("ahad patwary railway");
        const { groupName, userId, groupBio } = req.body;

        if (!groupName || !req.file)
        return res.status(400).json({ message: "groupName and groupPicture are required" });

        // ✅ Cloudinary upload
        const uploadResult = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "group_pictures" },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve({ public_id: result.public_id, secure_url: result.secure_url });
                }
            );
            stream.end(req.file?.buffer);
        });

        const picture = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
        };

            const Redis = getRedisClient();
            if(!Redis) return;

        const group = await Conversation.create({
            type: 'group',
            participants: [new Types.ObjectId(userId)],
            extraFields: {
                groupName,
                groupPicture: picture,
                groupAdmin: new Types.ObjectId(userId),
                groupBio
            }
        });

        const conversation = {
            type: 'group',
            participants: [userId],
            extraFields: {
                groupName,
                groupPicture: picture,
                groupAdmin: userId,
                groupBio
            }
        }


        await Redis.zadd(
            `user:${userId}:conversations`,
            Date.now(),
            JSON.stringify(conversation)
        );
        
        if(!group)
            return res.status(400).json({ message: 'user not created successfully' })
        ;

        return res.status(200).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error });
    }
});

export default router;
import { Server, Socket } from 'socket.io'
import groupMessage from '../../models/GroupMessage';
import { Types } from 'mongoose'

interface dataType{
    userId: string,
    groupId: string,
    text: string,
    referenceMessage: string,
}

export const sendGroupMessageHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('sendGroupMessage', async(data: dataType) => {

            const {userId, groupId, text, referenceMessage}: dataType = data;

            if(!userId || !groupId || !text || !referenceMessage) return;

            let message  = await groupMessage.create(
                {
                    senderId: new Types.ObjectId(userId),
                    groupId: new Types.ObjectId(groupId),
                    text,
                    referenceMessage: new Types.ObjectId(referenceMessage),
                }
            );
            message = await message
                .populate('senderId', '_id name picture')
                .populate({
                    path: 'referenceMessage',       // ১ম populate referenceMessage
                    populate: {                     // তার ভেতরে nested populate
                        path: 'senderId',           // referenceMessage এর ভেতরের senderId
                        select: 'name picture'      // যে ফিল্ডগুলো নিতে চাও
                    }
                })
            ;

            if(!message) return;

            io.to(groupId).emit('receiveGroupMessage', message)
        })
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}
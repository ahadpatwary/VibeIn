import { Server, Socket } from 'socket.io'
import groupMessage from '../../models/GroupMessage';
import { Types } from 'mongoose'

interface dataType{
    userId: string,
    groupId: string,
    text: string
}

export const sendGroupMessageHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('sendGroupMessage', async(data: dataType) => {

            const {userId, groupId, text}: dataType = data;

            if(!userId || !groupId || !text) return;

            const message  = await groupMessage.create(
                {
                    senderId: new Types.ObjectId(userId),
                    groupId: new Types.ObjectId(groupId),
                    text
                }
            );

            if(!message) return;

            io.to(groupId).emit('receiveGroupMessage', message)
        })
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}
import { Server, Socket } from 'socket.io'
import groupMessage from '../../models/GroupMessage';
import { Types } from 'mongoose'

interface dataType{
    name: string,
    picture: string,
    joinId: string,
    text: string,
    referenceMessage?: string,
    messageTime: string,
    conversationName: string,
    conversationPicture: string,
}


export const sendGroupMessageHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('sendGroupMessage', async(data: dataType) => {

            const {
                name,
                picture,
                joinId,
                text,
                referenceMessage,
                messageTime,
                conversationName,
                conversationPicture
            }: dataType = data;

            if(!name || !joinId || !text || !messageTime || !conversationName) return;

            let message = {
                name,
                picture,
                text,
                referenceMessage,
                messageTime
            }

            if(referenceMessage) {

                // message  = await groupMessage.create(
                //     {
                //         senderId: new Types.ObjectId(userId),
                //         groupId: new Types.ObjectId(groupId),
                //         text,
                //         referenceMessage: new Types.ObjectId(referenceMessage),
                //     }
                // );

                // message = await message.populate([
                // { path: 'senderId', select: '_id name picture' },
                // { 
                //     path: 'referenceMessage',
                //     populate: { path: 'senderId', select: 'name picture' }
                // }
                // ]);
            }else{
                // message  = await groupMessage.create(
                //     {
                //         senderId: new Types.ObjectId(userId),
                //         groupId: new Types.ObjectId(groupId),
                //         text,
                //         referenceMessage: null,
                //     }
                // );
                // message = await message.populate('senderId', 'name picture');
            }

            if(!message) return;

            io.to(joinId).emit('receiveGroupMessage', message)
        })
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}
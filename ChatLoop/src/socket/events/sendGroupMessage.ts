import { Server, Socket } from 'socket.io'
import groupMessage from '../../models/GroupMessage';
import { Types } from 'mongoose'
import conversation from '../../models/Conversations';

interface dataType{
    type: 'oneToOne'| 'group',
    messageId: string,
    senderId: string,
    receiverId: string | null,
    name: string,
    picture: string,
    joinId: string,
    text: string,
    referenceMessage: string | null,
    messageTime: string,
    conversationName: string | null,
    conversationPicture: string | null,
}


export const sendGroupMessageHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('sendGroupMessage', async(data: dataType) => {

            const {
                type, 
                messageId,
                senderId,
                receiverId,
                name,
                picture,
                joinId,
                text,
                referenceMessage,
                messageTime,
                conversationName,
                conversationPicture
            }: dataType = data;

            // if(!name || !joinId || !text || !messageTime || !conversationName) return;

            let message = {
                name,
                picture,
                text,
                referenceMessage,
                messageTime
            }

            if(type === 'oneToOne' && senderId && receiverId) {
                const isExistGroup = await conversation.findOne({
                    type: 'oneToOne',
                    participants: { $all: [ new Types.ObjectId(senderId), new Types.ObjectId(receiverId) ] }
                });

                let groupId = '';
                if(!isExistGroup) {
                    const newGroup = await conversation.create({
                        type: 'oneToOne',
                        participants: [ new Types.ObjectId(senderId), new Types.ObjectId(receiverId) ], 
                        lastMessage: text,
                        lastMessageTime: new Date(messageTime),
                    })
                    groupId = newGroup._id.toString();
                } else {
                    groupId = isExistGroup._id.toString();
                }
                socket.join(groupId);
                socket.to(groupId).emit('receiveGroupMessage', message)
                return;
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

            // if(!message) return;

            socket.to(joinId).emit('receiveGroupMessage', message)
        })
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}
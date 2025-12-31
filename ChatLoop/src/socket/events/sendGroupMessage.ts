import { Server, Socket } from 'socket.io'
import { Types } from 'mongoose'
import conversation from '../../models/Conversations';
import { getRedisClient } from '../../lib/redis';

interface dataType{
    // type: 'oneToOne'| 'group',
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

            let {
                // type, 
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
                messageId,
                joinId,
                name,
                picture,
                text,
                referenceMessage,
                messageTime,
                conversationName,
                conversationPicture
            };

            const Redis = getRedisClient();
            if(!Redis) return;
            
            // await Redis.hset(`message:${messageId}`, message);
     
         
            if(senderId && receiverId) {

                const isExistGroup = await conversation.findOne({
                    type: 'oneToOne',
                    participants: { $all: [ new Types.ObjectId(senderId), new Types.ObjectId(receiverId) ] }
                });


                let groupId = '';
                if(!isExistGroup) {
                    try{
                        const newGroup = await conversation.create({
                            type: 'oneToOne',
                            participants: [ new Types.ObjectId(senderId), new Types.ObjectId(receiverId) ], 
                            lastMessage: text,
                            lastMessageTime: new Date(messageTime),
                        })
                        await Redis.zadd(
                            `user:${senderId}:conversations`,
                            messageTime
                                ? new Date(messageTime).getTime()
                                : Date.now(),
                            JSON.stringify(
                                {
                                    type: 'oneToOne',
                                    participants: [senderId, receiverId]
                                }
                            )
                        );
                        await Redis.zadd(
                            `user:${receiverId}:conversations`,
                            messageTime
                                ? new Date(messageTime).getTime()
                                : Date.now(),
                            JSON.stringify(
                                {
                                    type: 'oneToOne',
                                    participants: [senderId, receiverId]
                                }
                            )
                        );

                        groupId = newGroup._id.toString();
                    }catch(err){
                        console.error('Error creating one-to-one conversation:', err);
                        return;
                    }
                } else {
                    const key = `chat:list:${joinId}`;
                    await Redis.rpush(key, JSON.stringify(message));
                    groupId = isExistGroup._id.toString();
                }

                const key = `chat:list:${groupId}`;
                await Redis.rpush(key, JSON.stringify(message));
        
                socket.join(groupId);
                socket.to(groupId).emit('receiveGroupMessage', message)
                return;
            }else{
                socket.to(joinId).emit('receiveGroupMessage', message)
                return;
            }

        })
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}
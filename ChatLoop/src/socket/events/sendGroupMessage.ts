import { Server, Socket } from 'socket.io'
import { Types } from 'mongoose'
import conversation from '../../models/Conversations';
import { getRedisClient } from '../../lib/redis';

interface dataType {
    type: 'oneToOne'| 'group',
    _id?: string,
    messageId?: string,
    senderId: string,
    receiverId: string | null,
    name: string,
    picture: string,
    joinId: string | null,
    text: string,
    referenceMessage: string | null,
    messageTime: string,
    conversationName: string,
    conversationPicture: string,
}


export const sendGroupMessageHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('sendGroupMessage', async(data: dataType) => {

            let {
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



            const Redis = getRedisClient();
            if(!Redis) return;     

            // joinId has null or string,

            if(joinId === null ){  // first send message
                try{
                    const newGroup = await conversation.create({
                        type: 'oneToOne',
                        participants: [ new Types.ObjectId(senderId), new Types.ObjectId(receiverId!) ], 
                        lastMessage: text,
                        lastMessageTime: new Date(messageTime),
                    })

                    if(!newGroup) return;

                    joinId = newGroup._id.toString();
                    socket.join(joinId as string);

                }catch(err){
                    console.error('Error creating one-to-one conversation:', err);
                    return;
                }
            }
        
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


            // const key = `chat:list:${joinId}`;
            // await Redis.rpush(key, JSON.stringify(message));

            // await Redis.zadd(
            //     `user:${senderId}:conversations`,
            //     Date.now(),
            //     joinId 
            // );

            // await Redis.zadd(
            //     `user:${receiverId}:conversations`,
            //     Date.now(),
            //     joinId,
            // );

            // await Redis.hset(`conversation:data`,
            //     joinId!,
            //     JSON.stringify(
            //         {
            //             type: 'oneToOne',
            //             participants: [senderId, receiverId],
            //             extraFields: {
            //                 conversationName: conversationName || "",
            //                 conversationPicture: conversationPicture || ""
            //             }
            //         }
            //     )
            // );

            io.to(`conversation:${joinId}:active`).emit('receiveGroupMessage', message);
            const participants = [senderId, receiverId];

            const participantRooms = participants.map(id => `user:${id}`);

            io.to( participantRooms )
                .except(`conversation:${joinId}:active`)
                .emit('conversation_update', {
                    joinId,
                    text,
                    messageTime
                }
            );
            
        })
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}



                        // await Redis.zadd(
                        //     `user:${senderId}:conversations`,
                        //     messageTime
                        //         ? new Date(messageTime).getTime()
                        //         : Date.now(),

                        //     joinId,
                        //     JSON.stringify(
                        //         {
                        //             type: 'oneToOne',
                        //             participants: [senderId, receiverId],
                        //             extraFields: {
                        //                 conversationName: conversationName || "",
                        //                 conversationPicture: conversationPicture || ""
                        //             }
                        //         }
                        //     )
                        // );


                        //                         await Redis.zadd(
                        //     `user:${receiverId}:conversations`,
                        //     messageTime
                        //         ? new Date(messageTime).getTime()
                        //         : Date.now(),
                        //     joinId,
                        //     JSON.stringify(
                        //         {
                        //             type: 'oneToOne',
                        //             participants: [senderId, receiverId],
                        //             extraFields: {
                        //                 conversationName: name || "",
                        //                 conversationPicture: picture || ""
                        //             }
                        //         }
                        //     )
                        // );
import { Server, Socket } from 'socket.io'
import { Types } from 'mongoose'
import conversation from '../../models/Conversations';
import { getRedisClient } from '../../lib/redis';


interface dataType {
    type: 'oneToOne'| 'group',
    _id: string,
    senderId: string,
    receiverId: string | null,
    name: string,
    picture: string,
    joinId: string | null,
    text: string,
    referenceMessage: string | null,
    messageTime: number,
    conversationName: string,
    conversationPicture: string,
}


export const sendGroupMessageHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('sendGroupMessage', async(data: dataType) => {

            let {
                type, 
                _id,
                senderId,
                receiverId,
                joinId,
                text,
                referenceMessage,
                messageTime,
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

                  
                    await Redis.hset(
                        `conversation:${joinId}`,
                        {
                            type,
                            participants: JSON.stringify([senderId, receiverId]),
                        }
                    )

                    io.to(`user:${senderId}`).emit('joinId', joinId);

                }catch(err){
                    console.error('Error creating one-to-one conversation:', err);
                    return;
                }
            }
        
            let message = {
                _id,
                joinId,
                senderId,
                text,
                referenceMessage,
                messageTime,
            };


            // const key = `chat:list:${joinId}`;
            // await Redis.rpush(key, JSON.stringify(message));

            await Redis.zadd(
                `conversation:${joinId}:messages`,
                messageTime || Date.now(),
                _id as string
            );

            await Redis.hset(
                `message:${_id}`,
                message
            );

            await Redis.zadd(
                `user:${senderId}:conversations`,
                messageTime || Date.now(),
                joinId as string
            );

            await Redis.zadd(
                `user:${receiverId}:conversations`,
                messageTime || Date.now(),
                joinId as string,
            );


            if(!socket.rooms.has(`conversation:${joinId}:active`)){
                socket?.join(`conversation:${joinId}:active`);
            }

            socket.to(`conversation:${joinId}:active`).emit('receiveGroupMessage', message);
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
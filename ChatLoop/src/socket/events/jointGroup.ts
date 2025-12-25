import { Server, Socket } from 'socket.io'
import { Types } from 'mongoose'
import Conversation from '../../models/Conversations'
interface dataType {
    userId: string,
    groupId: string
}
export const joinGroupHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('join-group', async(data: dataType) => {

            const { userId, groupId }: dataType = data;

            if(!userId || !groupId) return;

            const isMember = await Conversation.findOne(
                {
                    _id: new Types.ObjectId(groupId),
                    participants:{ $in: [new Types.ObjectId(userId)]}
                }
            )

            if(isMember){
                socket.join(groupId);
            }else{
                socket.emit('error', 'You are not a member of this group');
            }
        })
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}
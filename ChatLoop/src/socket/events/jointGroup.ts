import { Server, Socket } from 'socket.io'
import { Types } from 'mongoose'
import Conversation from '../../models/Conversations'
interface dataType {
    userId: string,
    joinId: string
}
export const joinGroupHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('join-group', async(data: dataType) => {

            const { userId, joinId }: dataType = data;

            if(!userId || !joinId) return;

            const isMember = await Conversation.findOne(
                {
                    _id: new Types.ObjectId(joinId),
                    participants:{ $in: [new Types.ObjectId(userId)]}
                }
            )

            if(isMember){
                socket.join(joinId);
                console.log("joined successful");
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
import { Server, Socket } from 'socket.io'


interface dataType {
    userId: string,
    joinId: string,
    newJoinId: string,
}
export const joinGroupHandler = (io: Server, socket: Socket) => {
    try {
        
        socket.on('join-group', async(data: dataType) => {

            const { userId, joinId, newJoinId }: dataType = data;
            

            if (joinId) {
                socket.leave(`conversation:${joinId}:active`);
            }
            socket?.join(`conversation:${newJoinId}:active`);
        })
        
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
    }
}
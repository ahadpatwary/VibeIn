import { Socket, Server } from 'socket.io'


interface propType {
    groupId: string;
}

export const groupTypingStateHandler = (io: Server, socket: Socket) => {

    socket.on('groupTyping', ({ groupId }: propType) => {
        
        if(!groupId) return;

        socket.to(groupId).emit('someoneGroupTyping');
    })

    socket.on('stopGroupTyping', ({ groupId }: propType) => {

        if(!groupId) return;

        socket.to(groupId).emit('someOneStopGroupTyping');
    })
}
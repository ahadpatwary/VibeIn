import { Server, Socket } from "socket.io";
import { addUserHandler } from "./events/addUser";
import { disConnectUserHandler } from "./events/disConnectuser";
import { typingStateHandler } from "./events/typingState";
import { joinGroupHandler } from "./events/jointGroup";
import { sendGroupMessageHandler } from "./events/sendGroupMessage";
import { groupTypingStateHandler } from "./events/groupTypingState";

export const setupSocket = (io: Server) => {

  io.on("connection", (socket: Socket) => {

    // const userId = '1234567';

    // socket.join(`user:${userId}`)

    addUserHandler(io, socket);
    typingStateHandler(io, socket);
    groupTypingStateHandler(io, socket);
    joinGroupHandler(io, socket);
    sendGroupMessageHandler(io, socket);
    disConnectUserHandler(io, socket);

  });
};
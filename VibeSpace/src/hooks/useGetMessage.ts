// import { useEffect, useState } from "react";
// import { Socket } from "socket.io-client";
// import React from "react";

// interface IMessage {
//     sender: string;
//     receiver: string;
//     text: string;
//     createdAt: string;
// }


// export const useGetMessage = (socket: Socket , userId: string, chatWith: string, setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>) => {

//     useEffect(() => {

//         if(!socket || !userId || !chatWith) return;

//         socket.on("getMessage", (msg: IMessage) => {
//             if ((msg.sender === chatWith && msg.receiver === userId) || (msg.sender === userId && msg.receiver === chatWith)) {
//                 setMessages(prev => [...prev, msg]);
//             }
//         });

//         return () => {
//             socket.off("getMessage");
//         };
//     }, [socket, userId, chatWith]);

//     // return messages;
// }
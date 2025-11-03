import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";


export const useActiveState = (socket: Socket , chatWith: string) => {
    
    const [offline, setOffline] = useState<Boolean>(false);

    useEffect(() => {

        if(!socket || !chatWith) return;
        
        socket.on("getUsers", (users) => {
            setOffline(!users.includes(chatWith));
        });

        return () => {
            socket.off("getUsers");
        };
    }, [socket, chatWith]);

    return offline;
}
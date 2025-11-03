import { useEffect, useState } from "react";
import { getData } from "@/lib/getData";
import React from "react";

interface IMessage {
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
}

interface getDataType {
    name:string;
    picture:{
        url:string;
        public_id:string;
    }
} 

export const useChatInformation = 
    (
        setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
        chatWith: string,
        userId: string
    ) => {

    const [name, setName] = useState("");
    const [picture, setPicture] = useState("");
    const [myPicture, setMyPicture] = useState("");

    useEffect(() => {
        (async()=>{

            const data: getDataType = await getData(chatWith, "User", ["name", "picture"]);
            setName(data?.name);
            setPicture(data?.picture?.url);

            const myData: getDataType =  await getData(userId, "User", ["picture"]);
            setMyPicture(myData?.picture?.url);

            const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getMessages', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, chatWith })
            });
            const dataMessages = await res.json();
            setMessages(dataMessages.messages || []);

        })();

    }, [chatWith, userId]);



    return { name, picture, myPicture };
}
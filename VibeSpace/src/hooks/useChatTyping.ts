// useChatTyping.js
import { useRef, useState } from "react";
import { debounce } from "lodash";
import { Socket } from "socket.io-client";

export const useChatTyping = (socket: Socket, receiver: string) => {
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const typingRef = useRef(false);

  // Stop typing event debounce
  const sendStopTyping = debounce(() => {
    socket.emit("stopTyping", { receiver });
    typingRef.current = false;
  }, 1000); // ১ সেকেন্ড পর stopTyping পাঠাবে

  // যখন user টাইপ করে
  const handleTyping = () => {
    if (!typingRef.current) {
      socket.emit("typing", { receiver });
      typingRef.current = true;
    }
    sendStopTyping();
  };

  // অন্য user typing করছে কিনা
  socket.off("someoneTyping");
  socket.off("someoneStopTyping");

  socket.on("someoneTyping", () => setSomeoneTyping(true));
  socket.on("someoneStopTyping", () => setSomeoneTyping(false));

  return { handleTyping, someoneTyping };
};

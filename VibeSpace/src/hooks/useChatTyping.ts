import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const useChatTyping = (socket: Socket | null, receiver: string) => {
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const typingRef = useRef(false);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = () => {
    if (!socket || !receiver) return;

    // প্রথমবার typing শুরু হলে ই event পাঠাও
    if (!typingRef.current) {
      socket.emit("typing", { receiver });
      typingRef.current = true;
    }

    // আগের stop timer clear করে দাও
    if (stopTimer.current) clearTimeout(stopTimer.current);

    // যদি 2s ধরে user কিছু না টাইপ করে → stopTyping পাঠাও
    stopTimer.current = setTimeout(() => {
      socket.emit("stopTyping", { receiver });
      typingRef.current = false;
    }, 1400);
  };

  useEffect(() => {
    if (!socket) return;

    const onTyping = () => setSomeoneTyping(true);
    const onStopTyping = () => setSomeoneTyping(false);

    socket.on("someoneTyping", onTyping);
    socket.on("someoneStopTyping", onStopTyping);

    return () => {
      socket.off("someoneTyping", onTyping);
      socket.off("someoneStopTyping", onStopTyping);
    };
  }, [socket]);

  return { handleTyping, someoneTyping };
};
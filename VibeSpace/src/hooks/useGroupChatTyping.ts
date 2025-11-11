import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const useChatTyping = (socket: Socket | null, groupId: string) => {
  const [someOneGroupTyping, setsomeOneGroupTyping] = useState(false);
  const typingRef = useRef(false);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = () => {
    if (!socket || !groupId) return;

    // প্রথমবার typing শুরু হলে ই event পাঠাও
    if (!typingRef.current) {
      socket.emit("groupTyping", { groupId });
      typingRef.current = true;
    }

    // আগের stop timer clear করে দাও
    if (stopTimer.current) clearTimeout(stopTimer.current);

    // যদি 2s ধরে user কিছু না টাইপ করে → stopTyping পাঠাও
    stopTimer.current = setTimeout(() => {
      socket.emit("stopGroupTyping", { groupId });
      typingRef.current = false;
    }, 1400);
  };

  useEffect(() => {
    if (!socket) return;

    const onTyping = () => setsomeOneGroupTyping(true);
    const onStopTyping = () => setsomeOneGroupTyping(false);

    socket.on("someoneGroupTyping", onTyping);
    socket.on("someOneStopGroupTyping", onStopTyping);

    return () => {
      socket.off("someoneGroupTyping", onTyping);
      socket.off("someOneStopGroupTyping", onStopTyping);
    };
  }, [socket]);

  return { handleTyping, someOneGroupTyping };
};
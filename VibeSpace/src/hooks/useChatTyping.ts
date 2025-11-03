import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const useChatTyping = (socket: Socket | null, roomId: string) => {
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const typingRef = useRef(false);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✍️ যখন user কিছু টাইপ করে
  const handleTyping = () => {
    if (!socket || !roomId) return;

    // প্রথমবার typing শুরু হলে event পাঠাও
    if (!typingRef.current) {
      socket.emit("typing", { roomId });
      typingRef.current = true;
    }

    // Timer clear করে নতুন Timer সেট করো
    if (stopTimer.current) clearTimeout(stopTimer.current);

    // 1.4s ধরে user কিছু না লিখলে stopTyping পাঠাও
    stopTimer.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId });
      typingRef.current = false;
    }, 1400);
  };

  // 📡 socket event গুলো listen করো
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

  // 🔗 যখনই room change হবে, join করাও
  useEffect(() => {
    if (socket && roomId) {
      socket.emit("joinRoom", roomId);
    }
  }, [socket, roomId]);

  return { handleTyping, someoneTyping };
};
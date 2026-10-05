'use client';

import { useCallback, useEffect, useState } from 'react';

/** Counts down in whole seconds from a wall-clock deadline (immune to timer drift / tab throttling). */
export function useCountdown(initialSeconds: number) {
   const [deadline, setDeadline] = useState(() => Date.now() + initialSeconds * 1000);
   const [now, setNow] = useState(() => Date.now());

   useEffect(() => {
      if (Date.now() >= deadline) return;
      const id = window.setInterval(() => {
         const current = Date.now();
         setNow(current);
         if (current >= deadline) window.clearInterval(id);
      }, 250);
      return () => window.clearInterval(id);
   }, [deadline]);

   const restart = useCallback((seconds: number) => {
      const current = Date.now();
      setNow(current);
      setDeadline(current + seconds * 1000);
   }, []);

   return { remaining: Math.max(0, Math.ceil((deadline - now) / 1000)), restart };
}

export function formatClock(totalSeconds: number): string {
   const minutes = Math.floor(totalSeconds / 60);
   const seconds = totalSeconds % 60;
   return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

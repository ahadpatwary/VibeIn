// 'use client'
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";

// export const useCheckArray = ( cardId: string | undefined, property: string) => {
//   const [exists, setExists] = useState(false);
//   const {data: session} = useSession();
//   const userId = session?.user.id;
  
//   useEffect(() => {
//     ;(async () => {

//       if (!cardId || !userId) return;

//       const res = await fetch("/api/findId", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, cardId, property }),
//       });
//       const data = await res.json();
//       setExists(data?.exists);
//     })();

//   }, [cardId, property]);

//   return exists;
// };
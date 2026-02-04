// import { useState } from "react";
// import { toggleArrayApi } from "@/lib/toggleArrayApi";
// import { useSession } from "next-auth/react";


// export const useToggleArray = () => {

//   const toggleArray = async (cardId: string | undefined, property: string) => {

//     const {data: session } = useSession();
//     const userId = session?.user.id;

//     if (!cardId || !userId) return;

//     try {
//       const result = await toggleArrayApi(userId, cardId, property);
//       return result; // e.g. { liked: true }
//     } catch (err) {
//       console.error(err);
//     } 
//   };

//   return { toggleArray };
// };
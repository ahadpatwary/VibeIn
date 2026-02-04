// import { useState, useEffect } from 'react'

// interface propType{
//     joinId: string,
//     conversationName: string,
//     conversationPicture: string,
// }

// export const useCheckConversationExistence = (userId: string, chatWith: string, setJoinId: (value: string | null) => void) => {

//     useEffect(() => {
//         ;(async() => {
//             try {
//                 const res = await fetch('https://vibein-production-d87a.up.railway.app/api/checkGroupIsExistOrNot',{
//                     method: "POST",
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({userId, chatWith})
//                 })

//                 if(!res.ok) return;

//                 const data = await res.json();

//                 if(data.message == null){
//                     setJoinId(null);
//                     return;
//                 }

//                 setJoinId(data.message._id);

//             } catch (error) {
//                 if(error instanceof Error)
//                     throw new Error(error.message)
//                 ;
//             }

//         })();
//     }, [userId, chatWith])

// }
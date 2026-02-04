// import { useEffect, useState } from 'react'



// export const useGetGroupMember = (groupId: string) => {

//     const [members, setMembers] = useState([]);

//     useEffect(() => {
//         ;(async() => {
//             try {
                
//                 const res = await fetch('https://vibein-production-d87a.up.railway.app/api/getGroupMembers', {
//                     method: "POST",
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({groupId})
//                 });

//                 const { members } = await res.json();
//                 setMembers(members.participants);

//             } catch (error) {
//                 if(error instanceof Error)
//                     throw new Error(error.message)
//                 ;
//             }
//         })();
//     }, [groupId])

//     return members;
// }
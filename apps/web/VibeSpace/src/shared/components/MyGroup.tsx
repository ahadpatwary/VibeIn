// import React, { useEffect, useState } from "react";
// import { AvatarDemo } from "@/components/AvaterDemo";
// import { useGetGroups } from "@/hooks/useGetGroups";
// import GroupCard from "../components/chatApp/GroupCard";
// import { useSession } from "next-auth/react";

// interface PropType {
//   _id: string;
//   groupName: string;
//   groupPicture: {
//     public_id: string;
//     url: string;
//   };
//   lastMessage: string;
// }

// export default function MyGroup() {
//   const getGroup = useGetGroups() || [];
//   const [isGroupList, setIsGroupList] = useState<boolean>(true);
//   const [groupName, setGroupName] = useState('U');
//   const [groupPicture, setGroupPicture] = useState("");
//   const [groupId, setGroupId] = useState('');
  
//   const {data: session} = useSession();
//   const userId = session?.user.id;

//   const handleClick = (req:PropType) => {
//     setGroupId(req._id);
//     setGroupName(req.groupName)
//     setGroupPicture(req.groupPicture.url)
//     setIsGroupList(prev => !prev);
//   }
//   return (
//     <>
//       {isGroupList ? (
//         getGroup?.length ? (
//           getGroup.map((req: PropType) => (
//             <button
//               key={req._id}
//               className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-600 transition"
//               onClick={() => handleClick(req)}
//             >
//               <div className="flex w-full p-2">
//                 <AvatarDemo
//                   src={req.groupPicture?.url || "/default.png"}
//                   size="size-15"
//                 />
//                 <div className="flex flex-col flex-1 min-w-0 px-2">
//                   <div className="flex justify-between items-center w-full">
//                     <h2 className="text-lg font-semibold text-gray-200 truncate">
//                       {req.groupName}
//                     </h2>
//                     <p className="text-sm text-gray-400 ml-auto">10:10</p>
//                   </div>
//                   <p className="text-gray-400 text-sm truncate">
//                     {req.lastMessage || "No message yet"}
//                   </p>
//                 </div>
//               </div>
//             </button>
//           ))
//         ) : (
//           <p className="text-gray-400 text-center">No groups found</p>
//         )
//       ) : (
//             <GroupCard 
//               type="group"
//               joinId={groupId} 
//               // setIsGroupList={setIsGroupList} 
//               conversationName={groupName} 
//               conversationPicture={groupPicture}
//             />
//       )}
//     </>
//   );
// }
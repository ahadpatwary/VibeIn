// 'use client';

// import React, {lazy, LazyExoticComponent } from 'react';
// import { useRouter } from 'next/navigation';
// import { ScrollArea } from '@/shared/components/ui/scroll-area';
// import options from '@/data/options.json';
// import { Button } from "../ui/button";
// import { MdGroup } from "react-icons/md";
// import { MdGroups2 } from "react-icons/md";
// import { HiDotsVertical } from "react-icons/hi";
// import Image from "next/image";


// interface componentProps {
//   setSelected: (routerName: string) => void;
// }

// const SettingSidebar = ({ setSelected }: componentProps ) => {

//   const router = useRouter();

//   const handleRoute = () => {
//     router.push('/chat-space');
//   }

//     return (
//       <div className="w-full h-dvh flex flex-col bg-zinc-800">
//         <header className="p-4 flex justify-between items-center bg-neutral-700 text-white">
//           <Image 
//               src="/ChatSpace_dark.png" 
//               alt="VibeIn Logo"
//               width={25}
//               height={25}
//             />
//           <h1 className="text-2xl font-semibold">Chat Space</h1>
//           <button className="text-2xl font-semibold" onClick={handleRoute}>
//             <HiDotsVertical />
//           </button>
//         </header>

//         <ScrollArea className="flex-1 p-3 overflow-y-auto">
//             {options.map((opt) => (
//               <button
//                 key={opt.key}
//                 className="w-full mb-2 bg-zinc-700 rounded p-3 hover:bg-zinc-700 transition"
//                 onClick={() => setSelected(opt.component)}
//               >
//                 {opt.option}
//               </button>
//             ))}
//         </ScrollArea>

//         <header className="py-3 px-7 flex justify-between items-center bg-neutral-700 text-white">
//           <Button>
//             <MdGroup />
//           </Button>
//           <Button>
//             <MdGroups2 />
//           </Button>
//         </header>
//       </div>
//     )
// }

// export default SettingSidebar;
// 'use client'
// import { useParams } from 'next/navigation';
// import { ResizableDemo } from '@/components/ResizableDemo'
// // import useFeed from '@/hooks/useFeed';
// import { MenubarDemo } from '@/components/Bar';
// import { UserProfile } from '@/components/UserProfile';

// export default function BlogPage() {
//   const params = useParams();
//   const userId = params?.userId as string;
//   // const isMobile = useIsMobile();

//   // const { data } = useFeed('cards', false, userId); 

//   return (
//     // !isMobile ? (
//       // <ResizableDemo post={data} userId={userId} Dot={false} />
//     ) : (
//       <div className="w-full h-dvh flex flex-col">
//         <MenubarDemo />
//         <UserProfile dot={false}  userId = {userId} />
//       </div>
//     )
//   );
// }
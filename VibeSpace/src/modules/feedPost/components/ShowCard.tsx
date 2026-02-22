'use client';

// // import { Dot } from '@/components/Dot';
// // import { AlertDialogDemo } from "@/components/Aleart";
// // import { DialogDemo } from "@/components/Edit";
// // import { ToggleButton } from '@/components/Toggle';
// // import { LikeButton } from '@/components/likeButton';
// // import { SaveButton } from "@/components/saveButton";
// // import { useUpdateCard } from "@/hooks/useUpdateCard";
// // import { ContentField } from "@/components/contentField";


// import Image from "next/image";
// import Link from "next/link";
// import { useEffect, useRef, useState } from "react";
// import { FaComments } from "react-icons/fa6";
// import { PiShareFatFill } from "react-icons/pi";
// import { Button } from "@/shared/components/ui/button";
// import { AvatarDemo } from "@/shared/components/AvaterDemo";

interface CardProps {
  cardId?: string;
  userId?: string;
  title?: string;
  image?: string;
  description?: string;
  userName?: string;
  userProfile?: {
    url: string | null,
    public_id: string | null,
  }
  dot?: boolean;
}


// function ShowCard({
//   cardId,
//   userId,
//   title,
//   image,
//   description,
//   userName,
//   userProfile,
//   dot = false,
// }: CardProps) {

//   //   const [state, setState] = useState<string>("");


//   // const { deleteItem } = useDelete();

//   //   const handleClick = async () => {
//   //     await deleteItem("Card", cardId);
//   //   };

//   const text = description;
//   const lines = 1;

//   const [expanded, setExpanded] = useState(false);
//   const [isOverflowing, setIsOverflowing] = useState(false);
//   const textRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const element = textRef.current;
//     if (!element) return;

//     const checkOverflow = () => {
//       const lineHeight = parseFloat(
//         window.getComputedStyle(element).lineHeight
//       );

//       const maxHeight = lineHeight * 2;
//       console.log("ans", maxHeight, element.scrollHeight);

//       if (element.scrollHeight >= maxHeight) {
//         setIsOverflowing(true);
//       } else {
//         setIsOverflowing(false);
//       }
//     };

//     checkOverflow();

//     const resizeObserver = new ResizeObserver(() => {
//       checkOverflow();
//     });

//     resizeObserver.observe(element);

//     return () => resizeObserver.disconnect();
//   }, []);

//   const str: string =
//     "This action cannot be undone. This will permanently delete your account and remove your data from our servers.";

//   return (
//     <div
//       className="
//         w-auto
//         p-2
//         border border-black 
//         shadow-md 
//         rounded-md 
//        mt-2
//       "
//     >
//       <div className="flex h-full m-2 w-full items-center gap-4 p-0">
//         <Button className="h-15 w-15 rounded-full m-0 cursor-pointer transfarent">
//           <AvatarDemo src={userProfile?.url ?? ""} />
//         </Button>

//         <div className="flex m-0 flex-col text-white w-full overflow-hidden">
//           <Link href={`${userId}`} className="font-bold">
//             {userName}
//           </Link>
//           <p className="text-white overflow-hidden text-lg text-bold truncate">
//             {title}
//           </p>
//         </div>
//       </div>
//       <div className="w-full">
//         <div
//           ref={textRef}
//           className={`text-white text-[15px] leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${expanded ? "" : `line-clamp-2`
//             }`}
//         >
//           {text}
//         </div>

//         {isOverflowing && (
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="mt-1 text-blue-600 font-medium text-sm hover:underline"
//           >
//             {expanded ? "Read less" : "Read more"}
//           </button>
//         )}
//       </div>
//       <div
//         className="
//           relative 
//           w-full 
//           h-[240px] sm:h-[250px] md:h-[270px] lg:h-[300px] 
//           border-2 
//           rounded 
//           overflow-hidden 
//           mb-4
//         "
//       >
//         <Image
//           src={image as string}
//           fill
//           alt="image"
//           loading="lazy"
//           sizes="(max-width: full) 220px, (max-width: full) 250px, 300px"
//           className="object-contain rounded"
//         />
//       </div>


//       <div
//         className="
//           flex flex-col justify-between 
//           w-full
//         "
//       >

//         {/* <div className="flex justify-between items-center gap-2 ">
//           <LikeButton cardId={cardId} />
//           <FaComments />
//           <PiShareFatFill />
//           {dot ? (
//             <Dot>
//               {({ setIsOpen }) => (
//                 <>
//                   <AlertDialogDemo
//                     setIsOpen={setIsOpen}
//                     name="Delete"
//                     title={str}
//                     button_name="Delete"
//                     handleClick={() => {
//                       setIsOpen?.(false);
//                       handleClick();
//                     }}
//                   />

//                   <DialogDemo
//                     loading={loading}
//                     error={error}
//                     setIsOpen={setIsOpen}
//                     name="Edit"
//                     cardTitle="Edit profile"
//                     handleUpdate={handleUpdate}
//                   >
//                     <ContentField
//                       title={title!}
//                       setTitle={setTitle}
//                       content={content}
//                       setContent={setContent}
//                       picture={picture}
//                       setPicture={setPicture}
//                     />
//                   </DialogDemo>

//                   <ToggleButton
//                     id={cardId}
//                     setIsOpen={setIsOpen}
//                     name="videoPrivacy"
//                     state={state}
//                   />
//                 </>
//               )}
//             </Dot>
//           ) : (
//             <SaveButton cardId={cardId} />
//           )}
//         </div> */}

//       </div>
//     </div>
//   );
// }

// export { ShowCard };


import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { AvatarDemo } from "@/shared/components/AvaterDemo";

// interface CardProps {
//   userId?: string;
//   title?: string;
//   image?: string;
//   description?: string;
//   userName?: string;
//   userProfile?: {
//     url: string | null;
//     public_id: string | null;
//   };
// }

function ShowCard({
  cardId,
  userId,
  title,
  image,
  description,
  userName,
  userProfile,
  dot = false,
}: CardProps) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkOverflow = () => {
      // overflow check only when collapsed
      if (!expanded) {
        const hasOverflow =
          element.scrollHeight > element.clientHeight;
        setIsOverflowing(hasOverflow);
      }
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [expanded]);

  return (
    <div className="w-auto p-3 border border-black shadow-md rounded-md mt-2">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button className="h-14 w-14 rounded-full bg-transparent p-0">
          <AvatarDemo src={userProfile?.url ?? ""} />
        </Button>

        <div className="flex flex-col w-full overflow-hidden text-white">
          <Link href={`${userId}`} className="font-bold">
            {userName}
          </Link>
          <p className="text-lg font-semibold truncate">
            {title}
          </p>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mt-2">
          <div
            ref={textRef}
            className={`text-gray-200 text-[15px] leading-relaxed transition-all duration-300 overflow-hidden whitespace-pre-line whitespace-pre-wrap ${expanded ? "" : "line-clamp-2"
              }`}
          >
            {description}
          </div>

          {/* Important: show button if either overflow exists OR expanded */}
          {(isOverflowing || expanded) && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="text-blue-400 font-medium text-sm hover:underline cursor-pointer"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Image */}
      {image && (
        <div className="relative w-full h-[240px] sm:h-[250px] md:h-[270px] lg:h-[300px] border-2 rounded overflow-hidden mt-3">
          <Image
            src={image}
            fill
            alt="card-image"
            loading="lazy"
            className="object-contain rounded"
          />
        </div>
      )}
    </div>
  );
}

export { ShowCard };
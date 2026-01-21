'use client';

import Image from "next/image";
import { AvatarDemo } from "@/components/AvaterDemo";
import { Button } from "@/components/ui/button";
import { Dot } from '@/components/Dot';
import Link from "next/link";
import { AlertDialogDemo } from "@/components/Aleart";
import { DialogDemo } from "@/components/Edit";
import { ToggleButton } from '@/components/Toggle';
import { currentState } from '@/lib/currentState';
import { LikeButton } from '@/components/likeButton';
import { SaveButton } from "@/components/saveButton";
import { useUpdateCard } from "@/hooks/useUpdateCard";
import { ContentField } from "@/components/contentField";
import { useEffect, useState } from "react";
import { useDelete } from "@/hooks/useDelete";
import { getData } from "@/lib/getData";
import { FaComments } from "react-icons/fa6";
import { PiShareFatFill } from "react-icons/pi";

interface CardProps {
  cardId?: string;
  userId?: string;
  title?: string;
  image?: string;
  description?: string;
  userName?: string;
  userProfile?: {
    url: string,
    public_id: string,
  }
  dot?: boolean;
}


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

  const [state, setState] = useState<string>("");

  const {
    // title,
    setTitle,
    content,
    setContent,
    picture,
    setPicture,
    loading,
    error,
    handleUpdate,
  } = useUpdateCard(cardId as string);

  const { deleteItem } = useDelete();

  const handleClick = async () => {
    await deleteItem("Card", cardId);
  };

  const str: string =
    "This action cannot be undone. This will permanently delete your account and remove your data from our servers.";

  return (
    <div
      className="
        w-auto
        p-2
        border border-black 
        shadow-md 
        rounded-md 
        m-2 sm:m-2 md:m-2 lg:m-3
      "
    >
      <div className="flex h-full m-2 w-full items-center gap-4 p-0 m-0">
        <Button className="h-15 w-15 rounded-full m-0 cursor-pointer transfarent">
          <AvatarDemo src={userProfile?.url} />
        </Button>

        <div className="flex m-0 flex-col w-full overflow-hidden">
          <Link href={`${userId}`} className="font-bold">
            {userName}
          </Link>
          <p className="text-white overflow-hidden text-lg text-bold truncate">
            {title}
          </p>
        </div>
      </div>
      <div
        className="
          relative 
          w-full 
          h-[240px] sm:h-[250px] md:h-[270px] lg:h-[300px] 
          border-2 
          rounded 
          overflow-hidden 
          mb-4
        "
      >
        <Image
          src={image as string}
          fill
          alt="image"
          loading="lazy"
          sizes="(max-width: full) 220px, (max-width: full) 250px, 300px"
          className="object-contain rounded"
        />
      </div>

     
      <div 
        className="
          flex flex-col justify-between 
          w-full
        "
      >
        
        <div className="flex justify-between items-center gap-2 ">
          <LikeButton cardId={cardId} />
          <FaComments />
          <PiShareFatFill />
          {dot ? (
            <Dot>
              {({ setIsOpen }) => (
                <>
                  <AlertDialogDemo
                    setIsOpen={setIsOpen}
                    name="Delete"
                    title={str}
                    button_name="Delete"
                    handleClick={() => {
                      setIsOpen?.(false);
                      handleClick();
                    }}
                  />

                  <DialogDemo
                    loading={loading}
                    error={error}
                    setIsOpen={setIsOpen}
                    name="Edit"
                    cardTitle="Edit profile"
                    handleUpdate={handleUpdate}
                  >
                    <ContentField
                      title={title!}
                      setTitle={setTitle}
                      content={content}
                      setContent={setContent}
                      picture={picture}
                      setPicture={setPicture}
                    />
                  </DialogDemo>

                  <ToggleButton
                    id={cardId}
                    setIsOpen={setIsOpen}
                    name="videoPrivacy"
                    state={state}
                  />
                </>
              )}
            </Dot>
          ) : (
            <SaveButton cardId={cardId} />
          )}
        </div>

      </div>
    </div>
  );
}

export { ShowCard };
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

interface CardProps {
  cardId?: string;
  userId?: string;
  title?: string;
  description?: string;
  image?: string;
  dot?: boolean;
}

interface dataType {
  name: string;
  picture: {
    url: string;
    public_id: string;
  };
}

function ShowCard({
  cardId,
  image,
  userId,
  dot = false,
}: CardProps) {

  const [state, setState] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [userName, setUserNmae] = useState<string>("");
 

  useEffect(() => {
    const fetchState = async () => {
      try {
        const result = await currentState(cardId, "videoPrivacy");
        setState(result);
        const data: dataType = await getData(userId as string, "User", ["name", "picture"]);
        setUserNmae(data.name);
        setProfilePic(data.picture.url);
      } catch (error) {
        console.error("Error fetching videoStatus:", error);
      }
    };
    if (cardId) fetchState();
  }, [cardId]);

  const {
    title,
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
        w-full 
        max-w-[350px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] 
        min-w-[340px] 
        mx-auto 
        p-4 
        border border-black 
        shadow-md 
        flex-1 
        rounded-md 
        m-2 sm:m-2 md:m-2 lg:m-3
      "
    >
      {/* Image */}
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
          sizes="(max-width: 640px) 220px, (max-width: 768px) 250px, 300px"
          className="object-contain rounded"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between h-[120px] sm:h-[130px] md:h-[140px] lg:h-[150px] w-full">
        {/* Top Buttons */}
        <div className="flex justify-between items-center gap-2 my-2">
          <LikeButton cardId={cardId} />
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
                      title={title}
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

        {/* User Info */}
        <div className="flex h-full w-full items-center gap-4">
          <Button className="h-15 w-15 rounded-full cursor-pointer transfarent">
            <AvatarDemo src={profilePic} />
          </Button>

          <div className="flex flex-col w-full overflow-hidden">
            <Link href={`${userId}`} className="font-bold">
              {userName}
            </Link>
            <p className="text-white overflow-hidden text-lg text-bold truncate">
              {title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ShowCard };
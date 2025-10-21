"use client";

import Image from "next/image"
import { AvatarDemo } from "@/components/AvaterDemo"
import { Button } from "@/components/ui/button"
import { Dot } from '@/components/Dot'
import Link from "next/link"
import { AlertDialogDemo } from "@/components/Aleart";
import { DialogDemo } from "@/components/Edit";
import { ToggleButton } from '@/components/Toggle'
import { currentState } from '@/lib/currentState'
import { LikeButton } from '@/components/likeButton'
import { SaveButton } from "@/components/saveButton";
import { useUpdateCard } from "@/hooks/useUpdateCard";
import { ContentField } from "@/components/contentField";
import  { useEffect , useState} from "react";
import { useDelete } from "@/hooks/useDelete";
import { getData } from "@/lib/getData";



interface CardProps {
  cardId?: string ;
  userId?: string;
  title?:string;
  description?: string;
  image?: string ;
  dot? : boolean;
}

interface dataType{
  name:string;
  picture:{
    url:string;
    public_id:string;
  }
}

function ShowCard(
  {
    cardId,
    // title,
    // description,
    image,
    userId,
    dot = false
  }: CardProps) {
    
  const [state, setState] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string> ("");
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

    const handleClick = async () =>{
      await deleteItem("Card", cardId);
    }
    


  const str : string = "This action cannot be undone. This will permanently delete your account and remove your data from our servers."

  return (
    <div
      className="w-full max-w-[450px] min-w-[430px] mx-auto p-4 border border-black shadow-md flex-1 rounded-lg h-[80vh] md:h-[80vh] lg:h-[85vh] m-3 overflow-hidden p-2"
    >
      
      <div 
        className="relative w-full h-[60%] md:h-[65%] lg:h-[70%] border-2 rounded overflow-hidden mb-4"
      >
        <Image
          src={image as string}
          fill
          alt="image"
          sizes="300"
          priority
          className="object-contain rounded"
        />
      </div>

 
      <div className=" h-[35%] md:h-[30%] lg:h-[25%] flex flex-col justify-between">
        <div className="flex justify-between items-center gap-2 my-2">
          
            < LikeButton cardId = {cardId} />

            { dot ?
              (
                <Dot>
                  {({ setIsOpen }) => (
                    <>
                      <AlertDialogDemo
                        setIsOpen={setIsOpen} 
                        name="Delete" 
                        title={str} 
                        button_name="Delete"
                        handleClick={()=>{
                          setIsOpen?.(false);
                          handleClick();
                        }}
                      />

                      <DialogDemo 
                        loading = {loading}
                        error ={error}
                        setIsOpen = {setIsOpen} 
                        name ="Edit" 
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
                        name ="videoPrivacy" 
                        state= { state }
                      />
                    </>
                  )}
                </Dot>
              )
              : < SaveButton  cardId = {cardId} />
            }
        </div>
  
        <div className="flex h-full items-center gap-4">
          <Button 
            className ="h-15 w-15 rounded-full cursor-pointer transfarent" 
          > 
            <AvatarDemo src={profilePic} /> 
          </Button> 

          <div className="flex flex-col">
            <Link href= {`${userId}` } className="font-bold"> {userName} </Link>
            <div className=" h-full w-fll">
              Lorem ipsum dolor sit amet, 
            </div>
            {/* <p className="text-2xl font-bold">{`${title}kdjfksjfksdfjskdfksdfjsdkjfdkjskjsfd`}</p> */}
            {/* <p> {description} </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export { ShowCard };
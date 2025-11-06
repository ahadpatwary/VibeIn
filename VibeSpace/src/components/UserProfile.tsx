'use client'

import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area'
import { AvatarDemo } from '@/components/AvaterDemo'
import { Dot } from '@/components/Dot'
import { ToggleButton } from '@/components/Toggle'
import { AlertDialogDemo } from "@/components/Aleart";
import { DialogDemo } from "@/components/Edit";
import {InputWithLabel} from '@/components/UserInformation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { useProfileUpdate } from '@/hooks/useProfileUpdate'
import { useSignOut } from '@/hooks/useSignOut'
import { useUserDelete } from '@/hooks/useUserDelete'
import { userIdClient } from '@/lib/userId'
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserProps{
    name?: string;
    email?: string;
    userId : string;
    dot? : boolean;
}

function UserProfile({ dot, userId } : UserProps){
    const str : string = "ahad patwary aj nai"
    const router = useRouter();
    const {
        name,
        setName, 
        profile,
        email,
        dob, 
        setDob, 
        phoneNumber, 
        setPhoneNumber, 
        picture, 
        setPicture, 
        // loading, 
        // error, 
        handleUpdate
    } = useProfileUpdate(userId);
    const { handleSignOut } = useSignOut();

    const { handleDelete } = useUserDelete();

    const handleRoute = async () => {
        const user = await userIdClient();
        router.push(`/chatloop?userId=${user}&chatWith=${userId}`);
    }

    const handleChatSpaceRoute = async () => {
        router.push('chat-space');
    }

    const handlePostsRoute = () => {

        if(userId !== ''){
            router.push(`/${userId}/posts`);
        } else router.push('/profile/posts');
    }

    const handleAboutRoute = () => {
        router.push('/about');
    }



    const isMobile = useIsMobile();

    return (
        

        <div className={`flex flex-1 flex-col justify-between items-center pt-10 pl-4 pr-4 pb-1 w-full ${!isMobile ? 'h-full': ''}`} >

            <ScrollArea className=" w-full rounded-lg">
            <Card className = "flex flex-col justify-center items-center gap-2 w-full p-4 rounded-lg ">
                <AvatarDemo src={ profile } size="size-30" />
                <p className='text-nowrap'>{ name }</p>
                <p>{ email }</p>
            </Card>
            <ScrollBar orientation="horizontal" />
            </ ScrollArea>

            
            <Card className = "flex justify-around items-center gap-2 w-full p-4 rounded-lg">
                {
                    isMobile ? 
                        <Button
                            variant="outline" 
                            className="h-[30px] w-full cursor-pointer"
                            onClick={handlePostsRoute}
                        >
                            Posts
                        </Button> 
                        : null
                }
                <Button
                    variant="outline" 
                    className="h-[30px] w-full cursor-pointer"
                    onClick={handleAboutRoute}
                >
                    About
                </Button> 
                        
                {dot ? (
                    <Button variant="outline" className="h-[30px] w-full cursor-pointer" 
                        onClick={handleChatSpaceRoute} >
                        ChatSpace
                    </Button>
                ): (
                    <Button variant="outline" className="h-[30px] w-full cursor-pointer" 
                        onClick={handleRoute} >
                        Message
                    </Button>
                )}


            </Card>


            <Card className="w-full p-3 flex !flex-row justify-between items-center !rounded !border-none">
                <p className = 'my-auto text-nowrap overflow-hidden'>Total Profile Like :</p>
                {dot ? (
                    <Dot>
                        {({ setIsOpen }) => (
                            <>
                                <DialogDemo handleUpdate={handleUpdate} setIsOpen={setIsOpen} name="Edit" cardTitle='kahd'>
                                    <InputWithLabel
                                        name={name}
                                        setName={setName}
                                        dob={dob}
                                        setDob={setDob}
                                        phoneNumber={phoneNumber}
                                        setPhoneNumber={setPhoneNumber}
                                        picture={picture}
                                        setPicture={setPicture} 
                                    />
                                </DialogDemo>

                                <AlertDialogDemo
                                    setIsOpen={setIsOpen}
                                    name="Log out"
                                    title={str}
                                    button_name="Log out"
                                    handleClick={handleSignOut}
                                />

                                <AlertDialogDemo
                                    setIsOpen={setIsOpen}
                                    name="Delete"
                                    title={str}
                                    button_name="Delete"
                                    handleClick={handleDelete}
                                />
                            </>
                        )}
                    </Dot>
                ) : (
                    <>
                        <ToggleButton />
                    </>
                )}
            </Card>
        </div> 
            
      
    )
}

export { UserProfile };
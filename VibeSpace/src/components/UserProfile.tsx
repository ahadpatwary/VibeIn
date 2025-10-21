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


    return (
        <>  
            <div className="flex flex-col h-[calc(100vh-10rem)] justify-around items-center p-6 w-full">
     

                <ScrollArea className=" w-full rounded-lg">
                <Card className = "flex flex-col justify-center items-center gap-2 w-full p-4 rounded-lg ">
                    <AvatarDemo src={ profile } size="size-30" />
                    <p className='text-nowrap'>{ name }</p>
                    <p>{ email }</p>
                </Card>
                <ScrollBar orientation="horizontal" />
                </ ScrollArea>

             
                <Card className = "flex justify-around items-center gap-2 w-full p-4 rounded-lg">
                    <CardContent className="h-[30px] min-w-[50px] !max-w-[100px]">
                        like
                    </CardContent>
                    <CardContent className="h-[30px] min-w-[50px] !max-w-[100px]">
                        dislike
                    </CardContent>
                    <Button variant="outline" className="h-[30px] w-full cursor-pointer" >
                        Message
                    </Button>
                </Card>
            </div>

            <Card className="w-full p-3 flex !flex-row justify-between items-center !rounded-none !border-none">
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
        </>
    )
}

export { UserProfile };
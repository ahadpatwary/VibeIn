import { useGetGroupMember } from "@/hooks/useGetGroupMember"
import { AvatarDemo } from "./AvaterDemo"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import React from 'react'
import { useBlockUser } from "@/hooks/useBlockUser"
import { useCommingRequest } from '@/hooks/useCommingRequest'

interface propType{
    groupName: string,
    groupPicture: string
    setIsGroup: React.Dispatch<React.SetStateAction<boolean>>
    groupId: string
    userId: string
}

export const Setting = ({groupName, groupPicture, setIsGroup, groupId, userId}: propType) => {
    
    const blockUser = useBlockUser( groupId);

    const commingRequest = useCommingRequest(groupId) || [{
        id: 1,
        name: "ahad",
        picture: {
            public_id: "",
            url:""
        }
    }];
  
    const members = useGetGroupMember(groupId) || [{
        id: 1,
        name: "ahad",
        picture: {
            public_id: "",
            url:""
        }
    }];

    return(
        <div className='h-dvh w-full overflow-y-auto'>
            <Button onClick={() => setIsGroup(prev => !prev)}>back</Button>
            <ScrollArea className=" w-full rounded-lg">
                <Card className = "flex flex-col justify-center items-center gap-2 w-full p-4 rounded-lg ">
                    <AvatarDemo src={ groupPicture } size="size-30" />
                    <p className='text-nowrap'>{ groupName }</p>
                    {/* <p>{ email }</p> */}
                </Card>
                <ScrollBar orientation="horizontal" />
            </ ScrollArea>
            <div>
                <Card className='flex my-2 border-none'>
                    <div>{`https://vibe-in-teal.vercel.app/chat-space/group/${groupId}`}</div>
                    <Button >Copy Link</Button>
                </Card>

                <ScrollArea className=" w-full rounded-lg">
                    <Card
                        className = "flex flex-col mb-2 h-[400px] justify-center items-center gap-2 w-full p-4 rounded-lg "
                    >
                        {
                            members.map(member => {
                                return (
                                    <div
                                        key={member._id}
                                        className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
                                    >
                                        <div className="flex w-full p-2">
                                        <AvatarDemo
                                            src={member.picture.url}
                                            size="size-15"
                                        />
                                        <div className="flex flex-col flex-1 min-w-0 px-2">
                                            <div className="flex justify-between items-center w-full">
                                            <h2 className="text-lg font-semibold text-gray-200 truncate">
                                                {member.name} 
                                            </h2> 
                                            {/* <p className="text-sm text-gray-400 ml-auto">
                                                {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p> */}

                                            <Button
                                                onClick={blockUser(member._id)} // change............. 
                                            >Block</Button>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                )
                            })
                        }

                    </Card>
                </ ScrollArea>

                <ScrollArea className=" w-full rounded-lg">
                    <Card
                        className = "flex flex-col mb-2 h-[400px] justify-center items-center gap-2 w-full p-4 rounded-lg "
                    >
                        {
                            commingRequest.map(member => {
                                return (
                                    <div
                                        key={member._id}
                                        className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
                                    >
                                        <div className="flex w-full p-2">
                                        <AvatarDemo
                                            src={member.picture.url}
                                            size="size-15"
                                        />
                                        <div className="flex flex-col flex-1 min-w-0 px-2">
                                            <div className="flex justify-between items-center w-full">
                                            <h2 className="text-lg font-semibold text-gray-200 truncate">
                                                {member.name} 
                                            </h2> 
                                            {/* <p className="text-sm text-gray-400 ml-auto">
                                                {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p> */}

                                            <Button
                                                onClick={blockUser(member._id)} // change............. 
                                            >Block</Button>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                )
                            })
                        }

                    </Card>
                </ ScrollArea>

                <Card className='my-2'>
                    <div>leave group</div>
                    <div>delete group</div>
                    <div>Report group</div>
                </Card>
            </div>
        </div>
    )
}
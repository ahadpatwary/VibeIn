import { useGetGroupMember } from "@/hooks/useGetGroupMember"
import { AvatarDemo } from "./AvaterDemo"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import React from 'react'
import { useBlockUser } from "@/hooks/useBlockUser"
import { useCommingRequest } from '@/hooks/useCommingRequest'
import { useAcceptRequest } from "@/hooks/useAcceptRequest"
import { useGetBlockUser } from "@/hooks/useGetBlockUser"
import { useUnBlockUser } from "@/hooks/useUnBlockUser"
import { GiFastBackwardButton } from "react-icons/gi";

interface propType{
    groupName: string,
    groupPicture: string
    setIsGroup: React.Dispatch<React.SetStateAction<boolean>>
    joinId: string
    userId: string
}

interface type{
    _id: string,
    name: string,
    picture: {
        public_id: string,
        url: string
    }
}

export const Setting = ({groupName, groupPicture, setIsGroup, joinId, userId}: propType) => {
    
    const blockUser = useBlockUser(joinId);
    const acceptRequst = useAcceptRequest(joinId);
    const unblockUser = useUnBlockUser(joinId);

    const commingRequest = useCommingRequest(joinId) || [{
        _id: 1,
        name: "ahad",
        picture: {
            public_id: "",
            url:""
        }
    }];
  
    const members = useGetGroupMember(joinId) || [{
        _id: 1,
        name: "ahad",
        picture: {
            public_id: "",
            url:""
        }
    }];

    const {blockUsers, setBlockUsers} = useGetBlockUser(joinId) || [{
        _id: 1,
        name: "ahad",
        picture: {
            public_id: "",
            url:""
        }
    }];
    

    return(
        <div className='h-dvh w-full sm:p-2 md:p-3 lg: p-4 bg-black overflow-y-auto'>
            <button onClick={() => setIsGroup(prev => !prev)}><GiFastBackwardButton /></button>
            <ScrollArea className=" w-full rounded-lg">
                <Card className = "flex flex-col justify-center items-center gap-2 w-full p-4 rounded-lg ">
                    <AvatarDemo src={ groupPicture } size="size-30" />
                    <p className='text-nowrap'>{ groupName }</p>
                    {/* <p>{ email }</p> */}
                </Card>
                <ScrollBar orientation="horizontal" />
            </ ScrollArea>
            <div>
                <Card className='flex my-2 px-2 border-none'>
                    <div>{`https://vibe-in-teal.vercel.app/chat-space/group/${joinId}`}</div>
                    <Button className="" >Copy Link</Button>
                </Card>

                <ScrollArea className=" w-full rounded-lg">
                    <Card
                        className = "flex flex-col mb-2 max-h-[400px] justify-center items-center gap-1 w-full p-2 rounded-lg "
                    >
                        {
                            members.map((member: type) => {
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
                                                onClick={() => {blockUser(member._id)}} // change............. 
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
                        className = "flex flex-col mb-2 max-h-[400px] justify-center items-center gap-2 w-full p-4 rounded-lg "
                    >
                        {
                            commingRequest.length ? (  commingRequest.map((request: type) => {
                                return (
                                    <div
                                        key={request._id}
                                        className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
                                    >
                                        <div className="flex w-full p-2">
                                        <AvatarDemo
                                            src={request.picture.url}
                                            size="size-15"
                                        />
                                        <div className="flex flex-col flex-1 min-w-0 px-2">
                                            <div className="flex justify-between items-center w-full">
                                            <h2 className="text-lg font-semibold text-gray-200 truncate">
                                                {request.name} 
                                            </h2> 
                                            {/* <p className="text-sm text-gray-400 ml-auto">
                                                {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p> */}

                                            <Button
                                                onClick={() => {acceptRequst(request._id)}} // change............. 
                                            >Accept Request</Button>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                )
                            }) ): <p>No User Request</p>
                        }

                    </Card>
                </ ScrollArea>

                <ScrollArea className=" w-full rounded-lg">
                    <Card
                        className = "flex flex-col mb-2 max-h-[400px] justify-center items-center gap-2 w-full p-4 rounded-lg "
                    >
                        {
                            blockUsers.length ? (  blockUsers.map(user => {
                                return (
                                    <div
                                        key={user._id}
                                        className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
                                    >
                                        <div className="flex w-full p-2">
                                        <AvatarDemo
                                            src={user.picture.url}
                                            size="size-15"
                                        />
                                        <div className="flex flex-col flex-1 min-w-0 px-2">
                                            <div className="flex justify-between items-center w-full">
                                            <h2 className="text-lg font-semibold text-gray-200 truncate">
                                                {user.name} 
                                            </h2> 
                                            {/* <p className="text-sm text-gray-400 ml-auto">
                                                {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p> */}

                                            <Button
                                                onClick={() => {unblockUser(user._id)}} // change............. 
                                            >Unblock</Button>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                )
                            }) ): <p>No User Request</p>
                        }

                    </Card>
                </ ScrollArea>

                <Card className='my-1 px-5 py-2 gap-2'>
                    <Button className="bg-red-200 text-red-500 p-0 m-0">leave group</Button>
                    <Button className="bg-red-200 text-red-500 p-0 m-0">delete group</Button>
                    <Button className="bg-red-200 text-red-500 p-0 m-0">Report group</Button>
                </Card>
            </div>
        </div>
    )
}
import { useGetSendRequest } from '@/hooks/useGetSendRequests'
import React from 'react'
import { AvatarDemo } from '@/components/AvaterDemo';
import { Button } from './ui/button';
import { useRemoveGroupRequest } from '@/hooks/useRemoveGroupRequest';


interface propType {
  _id: string,
  groupName: string,
  groupPicture: {
    public_id: string,
    url: string,
  },
  lastMessage: string
}

function AllRequest() {
  const sendRequest = useGetSendRequest() || [];
  const removeGroupRequest = useRemoveGroupRequest();
  return (
    <div className="p-3">
      {sendRequest.length > 0 ? (
        sendRequest.map((group: propType) => (
          <div
            key={group._id}
            className="w-full flex items-center w-full p-2 mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
          >
            
              <AvatarDemo
                src={group.groupPicture.url}
                size="size-15"
              />
              <div className="flex flex-col flex-1 min-w-0 px-2">
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-lg font-semibold text-gray-200 truncate">
                    {group.groupName}
                  </h2>
                </div>
                <p className="text-gray-900 text-sm truncate">{group.lastMessage}dd</p>
              </div>
              <Button
                onClick={ () => removeGroupRequest(group._id) } 
                className="cursor-pointer"
              >
                Cancle Request
              </Button>
            
          </div>
        ))
      ) : (
        <p>No groups found</p>
      )}
    </div>
  )
}

export default AllRequest
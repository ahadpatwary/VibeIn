import { useGetSendRequest } from '@/hooks/useGetSendRequests'
import React from 'react'
import { AvatarDemo } from '@/components/AvaterDemo';

interface propType {
  _id: string,
  groupName: string,
  groupPicture: {
    public_id: string,
    url: string,
  },
  lastMessage: string
}
function SendRequest() {
  const sendRequest = useGetSendRequest() || [];
  return (
       <>
          {
            sendRequest.map((req: propType) => ( 
              <div
                key={req._id}
                className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
              >
                <div className="flex w-full p-2">
                  <AvatarDemo
                    src={req.groupPicture}
                    size="size-15"
                  />
                  <div className="flex flex-col flex-1 min-w-0 px-2">
                    <div className="flex justify-between items-center w-full">
                      <h2 className="text-lg font-semibold text-gray-200 truncate">
                        {req.groupName}
                      </h2>
                      <p className="text-sm text-gray-400 ml-auto">
                        10:10
                      </p>
                    </div>
                    <p className="text-gray-900 text-sm truncate">{req.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          }
        </>
  )
}

export default SendRequest
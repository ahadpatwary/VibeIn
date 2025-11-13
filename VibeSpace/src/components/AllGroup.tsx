import { useGetAllGroups } from "@/hooks/useGetAllGroups"
import { useSendGroupRequest } from "@/hooks/useSendGroupRequest";
import { AvatarDemo } from '@/components/AvaterDemo';
import { Button } from "./ui/button";
import { ScrollArea } from "@radix-ui/react-scroll-area";


interface propType {
  _id: string,
  groupName: string,
  groupPicture: {
    public_id: string,
    url: string,
  },
  lastMessage: string
}

export default function AllGroup() {

  const allGroups = useGetAllGroups();
  const sendRequest = useSendGroupRequest();

  return (
    <ScrollArea className="w-full overflow-y-auto">

      <div className="h-dvh ">
        {allGroups.length > 0 ? (
          
          allGroups.map((group: propType) => (
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
                  onClick={ () => sendRequest(group._id) } 
                  className="cursor-pointer"
                >
                  Request
                </Button>
              
            </div>
          ))
        ) : (
          <p>No groups found</p>
        )}
      </div>
    </ScrollArea>
  );
}

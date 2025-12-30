import { useGetAllGroups } from "@/hooks/useGetAllGroups"
import { useSendGroupRequest } from "@/hooks/useSendGroupRequest";
import { AvatarDemo } from '@/components/AvaterDemo';
import { Button } from "./ui/button";
import { ScrollArea } from "@radix-ui/react-scroll-area";


interface propType {
  _id: string,
  extraFields: {
    groupName: string,
    groupPicture: {
      public_id: string,
      url: string,
    }
  }
}

export default function AllGroup() {

  const {allGroups, setAllGroups} = useGetAllGroups();
  const sendRequest = useSendGroupRequest();

  const handleClick = (groupId: string) => {
    setAllGroups((prev: propType[]) => prev.filter((group: propType) => groupId !== group._id))
    sendRequest(groupId);
  }

  return (
    <div className=""> 
    <ScrollArea className="">

        {allGroups.length > 0 ? (
          
          allGroups.map((group) => (
            <div
              key={group._id}
              className="w-full flex p-2 my-2 items-center w-full bg-zinc-700 rounded hover:bg-zinc-700 transition bg-red-500"
            >
              
                <AvatarDemo
                  src={group.extraFields.groupPicture.url}
                  size="size-15"
                />
                <div className="flex flex-col flex-1 min-w-0 px-2">
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-lg font-semibold text-gray-200 truncate">
                      {group.extraFields.groupName}
                    </h2>
                  </div>
                  {/* <p className="text-gray-900 text-sm truncate">{group.lastMessage}dd</p> */}
                </div>
                <Button
                  onClick={ () =>  handleClick(group._id)} 
                  className="cursor-pointer"
                >
                  Request
                </Button>
              
            </div>
          ))
        ) : (
          <p>No groups found</p>
        )}
    </ScrollArea>
    </div>
  );
}

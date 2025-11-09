import { useGetAllGroups } from "@/hooks/useGetAllGroups"
import { useSendGroupRequest } from "@/hooks/useSendGroupRequest";
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

export default function AllGroup() {

  const allGroups = useGetAllGroups();
  const sendRequest = useSendGroupRequest();

  return (
    <div>
      {allGroups.length > 0 ? (
        allGroups.map((group: propType) => (
          <button
            key={group._id}
            className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
            onClick={ () => sendRequest(group._id) }
          >
            <div className="flex w-full p-2">
              <AvatarDemo
                src={group.groupPicture.url}
                size="size-15"
              />
              <div className="flex flex-col flex-1 min-w-0 px-2">
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-lg font-semibold text-gray-200 truncate">
                    {group.groupName}
                  </h2>
                  <p className="text-sm text-gray-400 ml-auto">
                    10:10
                  </p>
                </div>
                <p className="text-gray-900 text-sm truncate">{group.lastMessage}</p>
              </div>
            </div>
          </button>
        ))
      ) : (
        <p>No groups found</p>
      )}
    </div>
  );
}

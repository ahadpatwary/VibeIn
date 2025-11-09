import { useGetAllGroups } from "@/hooks/useGetAllGroups"


interface PropType{
  _id: string,
  groupName: string;
}
export default function AllGroup() {

  const allGroups = useGetAllGroups();

  return (
    <div>
      {allGroups.length > 0 ? (
        allGroups.map((group: PropType) => (
          <button key={group._id} className="block p-2 bg-gray-200 rounded my-1">
            {group.groupName || group._id}
          </button>
        ))
      ) : (
        <p>No groups found</p>
      )}
    </div>
  );
}

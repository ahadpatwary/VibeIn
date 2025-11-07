"use client";

import { ContentField } from "@/components/contentField";
import { GroupCreate } from "@/components/ui/groupCreate";
import { useCreateGroup } from "@/hooks/useCreateGroup";

type CreatePostProps = {
  disabled?: boolean;
};

function CreateGroup({ disabled = false }: CreatePostProps) {
  const {
    groupName,
    setGroupName,
    groupBio,
    setGroupBio,
    setGroupPicture,
    loading,
    handleSubmit,
  } = useCreateGroup();

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[550px] min-w-[250px] w-full border shadow-lg rounded-md m-3">
      
      <GroupCreate
        groupName={groupName}
        setGroupName={setGroupName}
        groupBio={groupBio}
        setGroupBio={setGroupBio}
        setGroupPicture={setGroupPicture}
      />


      <button
        onClick={handleSubmit}
        disabled={loading || disabled}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Post"}
      </button>
    </div>
  );
}

export default CreateGroup;
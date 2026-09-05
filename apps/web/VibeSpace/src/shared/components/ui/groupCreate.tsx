'use client';

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

interface PropsType {
  groupName: string;
  setGroupName: (value: string) => void;
  groupBio: string;
  setGroupBio: (value: string) => void;
  setGroupPicture: (file: File | null) => void;
}

export const GroupCreate = ({
  groupName,
  setGroupName,
  groupBio,
  setGroupBio,
  setGroupPicture
}: PropsType) => {
  return (
    <>
      <Label htmlFor="title">Group Name</Label>
      <Input
        type="text"
        id="title"
        placeholder="Enter title..."
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <Label htmlFor="content">Group Bio</Label>
      <Textarea
        id="content"
        placeholder="Type your message here."
        value={groupBio}
        onChange={(e) => setGroupBio(e.target.value)}
      />

      <Label htmlFor="picture">Group Picture</Label>
      <Input
        id="picture"
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setGroupPicture(file);
        }}
      />
    </>
  );
};
'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PropsType {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  picture: File | null;
  setPicture: (file: File | null) => void;
}

export const ContentField = ({
  title,
  setTitle,
  content,
  setContent,
  setPicture,
}: PropsType) => {
  return (
    <>
      <Label htmlFor="title">Title</Label>
      <Input
        type="text"
        id="title"
        placeholder="Enter title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Label htmlFor="content">Content</Label>
      <Textarea
        id="content"
        placeholder="Type your message here."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Label htmlFor="picture">Picture</Label>
      <Input
        id="picture"
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setPicture(file);
        }}
      />
    </>
  );
};
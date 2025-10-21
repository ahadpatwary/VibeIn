"use client";

import { useCreateCard } from "@/hooks/useCreateCard";
import { ContentField } from "@/components/contentField";

type CreatePostProps = {
  disabled?: boolean;
};

function CreatePost({ disabled = false }: CreatePostProps) {
  const {
    title,
    setTitle,
    content,
    setContent,
    picture,
    setPicture,
    loading,
    error,
    handleSubmit,
  } = useCreateCard();

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[550px] min-w-[250px] w-full border shadow-lg rounded-md m-3">
      
      <ContentField
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        picture={picture}
        setPicture={setPicture}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

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

export default CreatePost;
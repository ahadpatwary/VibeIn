'use client'
import { useState } from "react";
import { createCard } from "@/lib/api";
import { useRouter } from "next/navigation";

export const useCreateCard = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [picture, setPicture] = useState<File| null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required");

    setError("");
    setLoading(true);
    try {
      await createCard({ title, content, picture });
      setTitle("");
      setContent("");
      setPicture(null);
      router.push('/feed');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
      setError(String(err));
    }
    } finally {
      setLoading(false);
    }
  };

  return { title, setTitle, content, picture, setPicture, setContent, loading, error, handleSubmit };
};
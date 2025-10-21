'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/createUser";

export const useCreateUser = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState<string>("");
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);
    try {
      await createUser({ name, phoneNumber, dob, picture });
      setName("");
      setPhoneNumber("");
      setPhoneNumber("");
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

  return { name, setName, dob, setDob, phoneNumber, setPhoneNumber, picture, setPicture, loading, error, handleSubmit };
};
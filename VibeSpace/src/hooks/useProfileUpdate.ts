'use client'
import { getData } from "@/lib/getData";
import { urlToFile } from "@/lib/urlToFile";
import { IUser } from "@/models/User";
import { useEffect, useRef, useState } from "react";
import { userIdClient } from "@/lib/userId";



export const useProfileUpdate = (userID: string = "") => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<string>("");
  const [profile, setProfile] = useState<string> ("");
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const oldPublicId = useRef<string>("");
  const userId = useRef<string | null>(userID);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log("ahad start");
        userId.current = userID === "" ?  await userIdClient() : userID;
        const id = userId.current;
        const data: IUser = await getData(id as string, "User", ["name", "email", "phoneNumber", "picture", "dob"]);
        if (!data) {
          setError("Data not present");
          return;
        }

        setName(data.name);
        setPhoneNumber(data.phoneNumber);
        setEmail(data.email)
        oldPublicId.current = data.picture.public_id;

        if (data.picture?.url) {
          setProfile(data.picture?.url);
          const fileRes = await urlToFile(data.picture?.url);
          if (fileRes.success && fileRes.file) {
            setPicture(fileRes.file);
          }
        }

      } catch (err) {
        if(err instanceof Error){
          setError(err.message || "Failed to fetch data");

        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdate = async () => {
    try {
      console.log("yse handle call");
      setLoading(true);

      const formData = new FormData();
      formData.append("id", userId.current as string);
      formData.append("name", name);
      formData.append('dob', dob);
      formData.append("phoneNumber", phoneNumber);
      formData.append("picture", picture as File);
      formData.append("property", "picture");
      formData.append('model', "User")
      console.log("publicID", oldPublicId.current);
      if(oldPublicId.current == "") console.log("yes empty");
      formData.append("oldPublicId", oldPublicId.current);


      const res = await fetch("/api/update", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Update failed");

    } catch (err) {
      if(err instanceof Error){
        setError(err.message || "Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return { name, setName, profile, email, dob, setDob, phoneNumber, setPhoneNumber, picture, setPicture, loading, error, handleUpdate };
};
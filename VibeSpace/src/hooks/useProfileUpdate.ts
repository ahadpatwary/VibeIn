'use client'
import { getData } from "@/lib/getData";
import { urlToFile } from "@/lib/urlToFile";
import { IUser } from "@/models/User";
import { error } from "console";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";



export const useProfileUpdate = (userID: string = "") => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<string>("");
  const [profile, setProfile] = useState<string> ("");
  const [picture, setPicture] = useState<File | null>(null);
  const oldPublicId = useRef<string>("");
  const userId = useRef<string | null>(userID);

  const {data: session} = useSession();
  const userId1 = session?.user.id;

  useEffect(() => {
    (async () => {
      try {

        
        userId.current = userID === "" ?  userId1! : userID;
        const id = userId.current;
        const data: IUser = await getData(id );
        
        if (!data) {
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
          throw new Error('error');
        }
      } 
    })();
  }, []);

  const handleUpdate = async () => {
    try {
   
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
        throw new Error("err");
      }
    }
  };

  return { name, setName, profile, email, dob, setDob, phoneNumber, setPhoneNumber, picture, setPicture, handleUpdate };
};
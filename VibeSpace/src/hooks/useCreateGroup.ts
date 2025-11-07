'use client'
import { userIdClient } from "@/lib/userId";
import React, { useState } from "react";


export const useCreateGroup = () => {

    const [groupName, setGroupName] = useState<string>("");
    const [groupBio, setGroupBio] = useState<string>("");
    const [groupPicture, setGroupPicture] = useState<File | null>(null);
    const [loading, setloading] = useState<boolean>(false);




    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const userId = await userIdClient();
            if (!groupName || !groupBio || !groupPicture || !userId) {
            return alert("সব ফিল্ড পূরণ করুন!");
        }
        
        const formData = new FormData();
        formData.append("groupName", groupName);
        formData.append("groupBio", groupBio);
        formData.append('userId', userId);
        formData.append("image", groupPicture); // backend e jei name use korcho, oita dite hobe
    
        try {
            setloading(true);
        
            const res = await fetch("https://vibein-production-d87a.up.railway.app/api/createGroup", {
                method: "POST",
                body: formData, // ❌ no headers here
            });
    
            if (!res.ok) throw new Error("Upload failed");
    
            const data = await res.json();
            console.log("Response:", data);
        
        } catch (err) {
            console.error(err);
        } finally {
            setloading(false);
        }
    };

    return { groupName, setGroupName, groupBio, setGroupBio, groupPicture, setGroupPicture, loading, handleSubmit };
}
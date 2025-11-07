'use client'
import { userIdClient } from "@/lib/userId";
import React, { useState } from "react";

function App() {
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [picture, setPicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userId = await userIdClient();
    if (!name || !bio || !picture || !userId) {
      return alert("সব ফিল্ড পূরণ করুন!");
    }

    const formData = new FormData();
    formData.append("groupName", name);
    formData.append("groupBio", bio);
    formData.append('userId', userId);
    formData.append("image", picture); // backend e jei name use korcho, oita dite hobe

    try {
      setUploading(true);
      
      const res = await fetch("https://vibein-production-d87a.up.railway.app/api/createGroup", {
        method: "POST",
        body: formData, // ❌ no headers here
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      alert("✅ Uploaded successfully!");
      console.log("Response:", data);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "50px auto", textAlign: "center" }}>
      <h2>🧩 Upload Group Info</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />

        <textarea
          placeholder="Enter Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              margin: "10px 0",
              objectFit: "cover",
            }}
          />
        )}

        <button
          type="submit"
          disabled={uploading}
          style={{
            padding: "10px 20px",
            background: uploading ? "gray" : "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}

export default App;
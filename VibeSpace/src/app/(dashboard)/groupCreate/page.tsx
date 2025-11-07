import React, { useState } from "react";


function App() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setPicture(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !bio || !picture) {
      return alert("সব ফিল্ড পূরণ করুন!");
    }

    const formData = new FormData();
    formData.append("groupName", name);
    formData.append("groupBio", bio);
    formData.append("picture", picture);

    try {
      setUploading(true);
      const res = await fetch("https://vibein-production-d87a.up.railway.app/api/createGroup",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: formData
      });
      if(!res.ok) throw new Error(res.message);
      alert("✅ Uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "50px auto", textAlign: "center" }}>
      <h2>🧩 Upload Profile</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Name"
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
            style={{ width: 150, height: 150, borderRadius: "50%", margin: "10px 0" }}
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
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}

export default App;
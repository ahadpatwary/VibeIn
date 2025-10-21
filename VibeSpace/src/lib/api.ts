export const createCard = async (payload: {
  title: string;
  content: string;
  picture?: File | null;
}) => {
  try {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("content", payload.content);
    if (payload.picture) {
      formData.append("picture", payload.picture);
    }

    const res = await fetch("/api/card", {
      method: "POST",
      body: formData, // 🚀 কোনো headers লাগবে না, browser নিজে থেকে boundary set করে নেবে
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to create card");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Card Error:", err);
    if (err instanceof Error) {
      throw new Error(err.message || "Something went wrong");
    } 
  }
};
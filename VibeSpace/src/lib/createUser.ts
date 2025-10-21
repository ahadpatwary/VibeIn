export const createUser = async (payload: {
  name: string;
  dob: string;
  phoneNumber: string;
  picture?: File | null;
}) => {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("dob", payload.dob);
    formData.append('phoneNumber', payload.phoneNumber);
    if (payload.picture) {
      formData.append("picture", payload.picture);
    }

    const res = await fetch("/api/user", {
      method: "POST",
      body: formData, // 🚀 কোনো headers লাগবে না, browser নিজে থেকে boundary set করে নেবে
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to create user");
    }

    return await res.json();
  } catch (err) {
    console.error("Create user Error:", err);
    if (err instanceof Error) {
      throw new Error(err.message || "Something went wrong");
    } 
  }
};
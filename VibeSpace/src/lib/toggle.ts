// src/services/userService.ts

export async function updateUser(cardId:string | undefined, field: string, value: string) {
  try {
    const res = await fetch("/api/updateone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        {
          cardId,
          field,
          value 
        }
      ),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to update user");
    }

    return data;
  } catch (err) {
    console.error("Update user error:", err);
    throw err;
  }
}

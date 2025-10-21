export const currentState = async (
  id: string | undefined,
  property: string
): Promise<string> => {
  try {
    const res = await fetch("/api/currentState", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, property }),
    });

    const data = await res.json();
    return data.value as string;
  } catch (err) {
    console.error("Create Card Error:", err);
    if (err instanceof Error) {
      throw new Error(err.message || "Something went wrong");
    }
    throw err; // <- type safety এর জন্য catch শেষে throw করো
  }
};
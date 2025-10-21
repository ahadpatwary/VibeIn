export const toggleArrayApi = async (
  userId: string,
  cardId: string | undefined,
  property: string
) => {
  const res = await fetch("/api/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, cardId, property }),
  });

  if (!res.ok) throw new Error("API call failed");
  return res.json();
};
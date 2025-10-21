export async function userIdClient() {
  const res = await fetch("/api/userId", { method: "GET" });
  const data = await res.json();

  if (!data.success) throw new Error("Failed to get user id");
  return data.id as string | null;
}
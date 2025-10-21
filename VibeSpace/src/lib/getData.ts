interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getData<T = unknown>(
  id: string,
  model: "User" | "Card",
  properties: string[]
): Promise<T> {
  try {

    const response = await fetch("/api/getData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, model, properties }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ API Error:", text);
      throw new Error(`API request failed: ${text}`);
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.error || "API returned unsuccessful response");
    }

    return data.data;
  } catch (err) {
    console.error("Fetch error:", err);
    if (err instanceof Error) {
      throw new Error(err.message || "Failed to fetch data");
    }
    throw new Error("Unknown error");
  }
}
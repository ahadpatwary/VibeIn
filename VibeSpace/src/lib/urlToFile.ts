export async function urlToFile(url: string): Promise<{ success: boolean; file?: File; message?: string }> {
    try {

        const response = await fetch(url);
        if (!response.ok) {
        return { success: false, message: "Failed to fetch file" };
        }

        const blob = await response.blob(); // fetch → blob
        const fileName = `temp_${Date.now()}.${url.split('.').pop()}`; // simple extension extraction
        const file = new File([blob], fileName, { type: blob.type });

        return { success: true, file };

    } catch (error) {
        console.error("urlToFile error:", error);
        return { success: false, message: "Failed to convert URL to file" };
    }
}
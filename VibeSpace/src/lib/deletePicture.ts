import cloudinary from "@/lib/cloudinary";

export const deleteFile = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return { success: false, message: "Delete failed" };
  }
};
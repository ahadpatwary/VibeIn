import { uploadFile } from '@/lib/uploadPicture';
import { deleteFile } from "@/lib/deletePicture";

interface UpdateFileOptions {
  newFile: File | null;
  oldPublicId: string;
  folder?: string;
}

export const updateFile = async ({
  newFile,
  oldPublicId,
  folder = "uploads",
}: UpdateFileOptions) => {
  try {
    if (!newFile) {
      return { success: false, data: null, message: "No new file provided" };
    }


    // পুরনো ফাইল থাকলে মুছে ফেলো
    if (oldPublicId !== "") {
      await deleteFile(oldPublicId);
    }

    // নতুন ফাইল upload করো
    const uploaded = await uploadFile(newFile, folder);

    if (!uploaded.success) {
      return { success: false, data: null, message: "File upload failed" };
    }

    return { success: true, data: uploaded , message:"successfull"};
  } catch (error) {
    console.error("File update error:", error);
    return { success: false, data:null, message: "Update failed" };
  }
};
import cloudinary from "@/lib/cloudinary";

export const uploadFile = async (file: File, folder: string = "uploads") => {
  try {
    // convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // upload to cloudinary
    const uploadRes = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString("base64")}`,
      { folder }
    );

    return {
      success: true,
      url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { success: false, url:"", public_id:"" };
  }
};
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // অবশ্যই set করতে হবে
  api_key: process.env.CLOUDINARY_API_KEY,        // অবশ্যই set করতে হবে
  api_secret: process.env.CLOUDINARY_API_SECRET,  // অবশ্যই set করতে হবে
  secure: true,
});

export default cloudinary;

import { preSignedUrlReturnType } from "./cloudinary.service";

export abstract class Storage {
  abstract preSignedUrl(urlNumber?: number): Promise<preSignedUrlReturnType[]>;
}
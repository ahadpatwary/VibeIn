import { Injectable } from "@nestjs/common";
import cloudinary from "src/shared/config/cloudinary/cloudinary.config";
import { ConfigService } from "@nestjs/config";
import { Storage } from "./storage.interface";

export interface preSignedUrlReturnType {
  signature: string,
  timestamp: number,
  public_id: string,
}

@Injectable()
export class CloudinaryStorage implements Storage {
  constructor(private readonly config: ConfigService) {}

  async preSignedUrl(urlNumber: number): Promise<preSignedUrlReturnType[]> {


    const signatures: preSignedUrlReturnType[] = [];

    const params = {
      folder: 'production_assets/profiles',
      context: 'author=ahad|category=avatar|env=prod',
      tags: 'user_profile,website_v2',
      eager_async: true,  // eita important!
      transformation: 'c_limit,w_1000/q_auto,f_auto',
      overwrite: false,
      access_mode: 'public',
      unique_filename: true,
      use_filename: false
    }

    for (let i = 0; i < urlNumber; i++)  {

      const timestamp = Math.round(Date.now() / 1000);
      const publicId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const paramsToSign = {
        public_id: publicId,
        timestamp: timestamp,
        ...params
      };

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        this.config.get<string>('cloudinary.api_secret')!,
      );

      signatures.push({ signature, timestamp, public_id: publicId})

    }

    return signatures ;
  }
}
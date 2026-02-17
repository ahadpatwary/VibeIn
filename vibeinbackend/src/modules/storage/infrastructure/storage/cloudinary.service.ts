import { Injectable } from "@nestjs/common";
import cloudinary from "src/shared/config/cloudinary/cloudinary.config";
import { ConfigService } from "@nestjs/config";
import { Storage } from "./storage.interface";

export interface preSignedUrlReturnType {
  signature: string,
  timestamp: number,
  public_id: string,
  cloudName?: string,
  apiKey?: string,
  folder: string,
  context: string,
  tags: string
}

@Injectable()
export class CloudinaryStorage implements Storage {
  constructor(private readonly config: ConfigService) {}

  async preSignedUrl(): Promise<preSignedUrlReturnType> {

    const timestamp = Math.round(Date.now() / 1000);

    const publicId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const paramsToSign = {
      timestamp: timestamp,
      folder: 'production_assets/profiles',
      public_id: publicId,
      context: 'author=ahad|category=avatar|env=prod',
      tags: 'user_profile,website_v2',
      transformation: 'c_limit,w_1000/q_auto,f_auto',
      overwrite: false,
      access_mode: 'public',
      unique_filename: true,
      use_filename: false
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.config.get<string>('cloudinary.api_secret')!,
    );

    return {
      signature,
      timestamp,
      public_id: publicId,
      folder: paramsToSign.folder,
      context: paramsToSign.context,
      tags: paramsToSign.tags
    };
  }
}
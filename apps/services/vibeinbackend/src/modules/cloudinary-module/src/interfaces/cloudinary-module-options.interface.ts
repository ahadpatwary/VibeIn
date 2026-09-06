import { ModuleMetadata, Type } from '@nestjs/common';

export interface CloudinaryModuleOptions {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  secure: boolean;
  uploadFolder: string;
  maxRetryAttempts: number;
  retryBaseDelayMs: number;
  signedUrlTtlSeconds: number;
}

export interface CloudinaryOptionsFactory {
  createCloudinaryOptions(): Promise<CloudinaryModuleOptions> | CloudinaryModuleOptions;
}

export interface CloudinaryModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<CloudinaryOptionsFactory>;
  useClass?: Type<CloudinaryOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<CloudinaryModuleOptions> | CloudinaryModuleOptions;
  inject?: any[];
}

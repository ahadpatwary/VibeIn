import { Injectable } from "@nestjs/common";
import { preSignedUrlReturnType } from "../infrastructure/storage/cloudinary.service";
import { Storage } from "../infrastructure/storage/storage.interface";



@Injectable()
export class StorageService {
    constructor(
        private readonly storage: Storage
    ) {}
    
    async getPreSignedUrl(): Promise<preSignedUrlReturnType> {
        return this.storage.preSignedUrl();
    }

}
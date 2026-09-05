import { Global, Module } from "@nestjs/common";
import { StorageController } from "./presentation/controller/storage.controller";
import { ConfigService } from "@nestjs/config";
import { StorageService } from "./application/storage.service";
import { CloudinaryStorage } from "./infrastructure/storage/cloudinary.service";
import { Storage } from "./infrastructure/storage/storage.interface";


@Global()
@Module({
    imports: [],
    controllers: [StorageController],
    providers: [
        ConfigService,
        StorageService,
        { provide: Storage, useClass: CloudinaryStorage}
    ],
    exports: [StorageService],
})
export class StorageModule {}
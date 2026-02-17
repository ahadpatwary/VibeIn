import { Controller, Get } from "@nestjs/common";
import { StorageService } from "../../application/storage.service";


@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get("signed-url")
  getSignedUrl() {
    return this.storageService.getPreSignedUrl();
  }
}
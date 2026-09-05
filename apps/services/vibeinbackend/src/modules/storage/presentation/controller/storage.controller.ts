import { Controller, Get, Query } from "@nestjs/common";
import { StorageService } from "../../application/storage.service";


@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get("signed-url")
  getSignedUrl(@Query("count") count: string) {
    const num = Number(count) || 1;
    return this.storageService.getPreSignedUrl(num);
  }
}
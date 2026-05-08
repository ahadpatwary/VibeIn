import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! in this application we are going to learn about codecloude and how to use it with nestjs';
  }
}

import 'reflect-metadata';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseValidationInterceptor } from './shared/interceptors/response-validation.interceptor';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.enableCors({
      origin: true,
      credentials: true,
   });

   app.useGlobalInterceptors(new ResponseValidationInterceptor(app.get(Reflector)));
   app.useGlobalFilters(new GlobalExceptionFilter());
   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         forbidNonWhitelisted: true,
         transform: true,
      }),
   );
   await app.listen(process.env.PORT ?? 3000);
}

(async () => await bootstrap())();

// “Even during exams, you won’t need to uninstall VibeIn — because every moment here adds real value to your future.”

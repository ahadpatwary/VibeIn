import { DynamicModule, Module, Provider } from '@nestjs/common';
import { v2 as CloudinaryClient } from 'cloudinary';
import { CLOUDINARY_CLIENT, CLOUDINARY_MODULE_OPTIONS } from './constants/cloudinary.constants';
import {
  CloudinaryModuleAsyncOptions,
  CloudinaryModuleOptions,
  CloudinaryOptionsFactory,
} from './interfaces/cloudinary-module-options.interface';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { RolesGuard } from './guards/roles.guard';
import { CloudinaryConfigException } from './exceptions/cloudinary.exception';

function buildClientProvider(): Provider {
  return {
    provide: CLOUDINARY_CLIENT,
    useFactory: (options: CloudinaryModuleOptions) => {
      if (!options.cloudName || !options.apiKey || !options.apiSecret) {
        throw new CloudinaryConfigException(
          'CloudinaryModule: cloudName, apiKey and apiSecret are all required.',
        );
      }
      CloudinaryClient.config({
        cloud_name: options.cloudName,
        api_key: options.apiKey,
        api_secret: options.apiSecret,
        secure: options.secure,
      });
      return CloudinaryClient;
    },
    inject: [CLOUDINARY_MODULE_OPTIONS],
  };
}

@Module({})
export class CloudinaryModule {
  /** Static registration — pass options directly (e.g. already-validated env). */
  static forRoot(options: CloudinaryModuleOptions): DynamicModule {
    return {
      module: CloudinaryModule,
      controllers: [CloudinaryController],
      providers: [
        { provide: CLOUDINARY_MODULE_OPTIONS, useValue: options },
        buildClientProvider(),
        CloudinaryService,
        FileValidationPipe,
        RolesGuard,
      ],
      exports: [CloudinaryService],
    };
  }

  /** Async registration — resolve options from ConfigService, etc. */
  static forRootAsync(asyncOptions: CloudinaryModuleAsyncOptions): DynamicModule {
    return {
      module: CloudinaryModule,
      imports: asyncOptions.imports ?? [],
      controllers: [CloudinaryController],
      providers: [
        ...this.createAsyncProviders(asyncOptions),
        buildClientProvider(),
        CloudinaryService,
        FileValidationPipe,
        RolesGuard,
      ],
      exports: [CloudinaryService],
    };
  }

  private static createAsyncProviders(options: CloudinaryModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: CLOUDINARY_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: CLOUDINARY_MODULE_OPTIONS,
          useFactory: async (factory: CloudinaryOptionsFactory) =>
            factory.createCloudinaryOptions(),
          inject: [options.useClass],
        },
        { provide: options.useClass, useClass: options.useClass },
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: CLOUDINARY_MODULE_OPTIONS,
          useFactory: async (factory: CloudinaryOptionsFactory) =>
            factory.createCloudinaryOptions(),
          inject: [options.useExisting],
        },
      ];
    }

    throw new CloudinaryConfigException(
      'CloudinaryModule.forRootAsync requires useFactory, useClass, or useExisting.',
    );
  }
}

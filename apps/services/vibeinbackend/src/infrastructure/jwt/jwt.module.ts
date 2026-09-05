import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JWT_SECRET } from './jwt.service';

@Module({})
export class JwtModule {
    static forRoot(): DynamicModule {
        return {
            module: JwtModule,
            providers: [
                {
                    provide: JWT_SECRET,
                    useFactory: (config: ConfigService) => {
                        const secret = config.get<string>('JWT_SECRET');
                        if (!secret) {
                            throw new Error('JWT_SECRET is not set in environment config');
                        }
                        return secret;
                    },
                    inject: [ConfigService],
                },
                JwtService,
            ],
            exports: [JwtService],
        };
    }
}
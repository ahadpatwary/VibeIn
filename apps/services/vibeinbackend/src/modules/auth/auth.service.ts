import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RabbitMqService } from "src/infrastructure/mq/mq.service";
import { RedisService } from "src/shared/modules/cache/redis.service";
import { TokenService } from "src/shared/services/jwtToken.service";
import { OAuthService } from "src/shared/services/oauth.service";
import { OtpService } from "src/shared/services/otp.service";
import { SessionService } from "src/shared/services/session.service";
import { Request, Response } from 'express';

const REFRESH_COOKIE = 'refresh_token';


@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly isProd = process.env.NODE_ENV === 'production';

    constructor(
        private readonly otp: OtpService,
        private readonly token: TokenService,
        private readonly session: SessionService,
        private readonly oauth: OAuthService,
        private readonly redis: RedisService,
        private readonly mq: RabbitMqService,
        private readonly config: ConfigService
    ) {}

    private setRefreshCookie(res: Response, token: string): void {
        res.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            secure: this.isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: TTL.refreshToken * 1000,
        })
    }

    private clearRefreshCookie(res: Response): void {
        res.clearCookie(REFRESH_COOKIE, {
            httpOnly: true,
            path: '/'
        })
    }

}
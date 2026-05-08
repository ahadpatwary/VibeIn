import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const accessToken = this.extractToken(req, 'accessToken');
    const refreshToken = this.extractToken(req, 'refreshToken');

    
    if (!accessToken) {
      res.status(401).json({
        message: 'Access token missing',
        code: 'ACCESS_TOKEN_EXPIRED',
      });

      return false;
    }

    try {
     
        const payload = await this.jwtService.verifyAsync(accessToken, {
            secret: process.env.NEXTAUTH_SECRET,
            algorithms: ['HS256'],
            issuer: 'smreaz.com',
            audience: 'VibeIn_client',
        }); 

        if(!payload){
            throw new HttpException(
                {
                    message: "Invalid access token",
                    code: "ACCESS_TOKEN_EXPIRED",
                },
                HttpStatus.UNAUTHORIZED
            );
        }

      req['user'] = payload; 
      return true;

    } catch (err) {

        return false;
    }
  }

  private extractToken(req: Request, tokenName: string): string | null {
    
    if (req.cookies && req.cookies[tokenName]) {
      return req.cookies[tokenName];
    }

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return null;
  }
}
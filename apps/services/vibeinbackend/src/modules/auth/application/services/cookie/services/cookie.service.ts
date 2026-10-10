import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import type { CookieOptions } from 'express';
import { AUTH_COOKIE_NAMES } from '../constants/constant';

@Injectable()
export class CookieService {
   private readonly accessTokenOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
   };

   private readonly refreshTokenOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
   };

   /**
    * In my current set up I can't store "accessToken" on cookie
    * I store "accessToken" in js variable
    * so that, when user refresh the browser the access token will be deleted.
    * And also no one access this.
    */
   setAccessToken(response: Response, token: string): void {
      response.cookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, token, this.accessTokenOptions);
   }

   setRefreshToken(response: Response, token: string): void {
      response.cookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, token, this.refreshTokenOptions);
   }

   setAuthTokens(response: Response, accessToken: string, refreshToken: string): void {
      this.setAccessToken(response, accessToken);
      this.setRefreshToken(response, refreshToken);
   }

   clearAccessToken(response: Response): void {
      response.clearCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, this.accessTokenOptions);
   }

   clearRefreshToken(response: Response): void {
      response.clearCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, this.refreshTokenOptions);
   }

   clearAuthCookies(response: Response): void {
      this.clearAccessToken(response);
      this.clearRefreshToken(response);
   }
}

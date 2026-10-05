import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OAuthProfile {
   id: string;
   email?: string;
   name: string;
   avatar?: string;
   provider: 'google' | 'github';
}

interface GoogleTokenResponse {
   access_token: string;
   token_type?: string;
   expires_in?: number;
   refresh_token?: string;
}

interface GoogleUserInfoResponse {
   sub: string;
   email?: string;
   name?: string;
   given_name?: string;
   picture?: string;
}

interface GithubTokenResponse {
   access_token: string;
   token_type?: string;
   scope?: string;
   error?: string;
   error_description?: string;
}

interface GithubProfileResponse {
   id: number;
   email?: string | null;
   name?: string | null;
   login?: string;
   avatar_url?: string;
}

interface GithubEmailResponse {
   email: string;
   primary: boolean;
   verified: boolean;
}

@Injectable()
export class OAuthService {
   private readonly logger = new Logger(OAuthService.name);

   constructor(private readonly config: ConfigService) {}

   // ─────────────────────────────────────────────────────
   // Google
   // ─────────────────────────────────────────────────────

   getGoogleAuthUrl(): string {
      const params = new URLSearchParams({
         client_id: this.getRequiredConfig('GOOGLE_CLIENT_ID'),
         redirect_uri: this.getRequiredConfig('GOOGLE_REDIRECT_URI'),
         response_type: 'code',
         scope: 'openid email profile',
         access_type: 'offline',
         prompt: 'select_account',
      });

      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
   }

   async exchangeGoogleCode(code: string): Promise<OAuthProfile> {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams({
            code,
            client_id: this.getRequiredConfig('GOOGLE_CLIENT_ID'),
            client_secret: this.getRequiredConfig('GOOGLE_CLIENT_SECRET'),
            redirect_uri: this.getRequiredConfig('GOOGLE_REDIRECT_URI'),
            grant_type: 'authorization_code',
         }),
      });

      if (!tokenRes.ok) {
         const errorBody = await tokenRes.text();

         this.logger.error(`Google token exchange failed: ${errorBody}`);

         throw new BadRequestException('Google authentication failed');
      }

      const tokens = (await tokenRes.json()) as GoogleTokenResponse;

      if (!tokens.access_token) {
         this.logger.error('Google token response did not contain an access token');

         throw new BadRequestException('Google authentication failed');
      }

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
         headers: {
            Authorization: `Bearer ${tokens.access_token}`,
         },
      });

      if (!profileRes.ok) {
         const errorBody = await profileRes.text();

         this.logger.error(`Google profile request failed: ${errorBody}`);

         throw new BadRequestException('Failed to fetch Google profile');
      }

      const profile = (await profileRes.json()) as GoogleUserInfoResponse;

      return {
         id: profile.sub,
         email: profile.email,
         name: profile.name ?? profile.given_name ?? 'Google User',
         avatar: profile.picture,
         provider: 'google',
      };
   }

   // ─────────────────────────────────────────────────────
   // GitHub
   // ─────────────────────────────────────────────────────

   getGithubAuthUrl(): string {
      const params = new URLSearchParams({
         client_id: this.getRequiredConfig('GITHUB_CLIENT_ID'),
         redirect_uri: this.getRequiredConfig('GITHUB_REDIRECT_URI'),
         scope: 'read:user user:email',
      });

      return `https://github.com/login/oauth/authorize?${params.toString()}`;
   }

   async exchangeGithubCode(code: string): Promise<OAuthProfile> {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
         },
         body: JSON.stringify({
            client_id: this.getRequiredConfig('GITHUB_CLIENT_ID'),
            client_secret: this.getRequiredConfig('GITHUB_CLIENT_SECRET'),
            code,
            redirect_uri: this.getRequiredConfig('GITHUB_REDIRECT_URI'),
         }),
      });

      if (!tokenRes.ok) {
         const errorBody = await tokenRes.text();

         this.logger.error(`GitHub token exchange failed: ${errorBody}`);

         throw new BadRequestException('GitHub authentication failed');
      }

      const tokens = (await tokenRes.json()) as GithubTokenResponse;

      if (tokens.error) {
         this.logger.error(`GitHub OAuth error: ${tokens.error_description ?? tokens.error}`);

         throw new BadRequestException(
            tokens.error_description ?? 'GitHub OAuth authentication failed',
         );
      }

      if (!tokens.access_token) {
         this.logger.error('GitHub token response did not contain an access token');

         throw new BadRequestException('GitHub authentication failed');
      }

      const headers = {
         Authorization: `Bearer ${tokens.access_token}`,
         Accept: 'application/vnd.github.v3+json',
      };

      const [profileRes, emailsRes] = await Promise.all([
         fetch('https://api.github.com/user', {
            headers,
         }),
         fetch('https://api.github.com/user/emails', {
            headers,
         }),
      ]);

      if (!profileRes.ok) {
         const errorBody = await profileRes.text();

         this.logger.error(`GitHub profile request failed: ${errorBody}`);

         throw new BadRequestException('Failed to fetch GitHub profile');
      }

      const profile = (await profileRes.json()) as GithubProfileResponse;

      let email = profile.email ?? undefined;

      if (emailsRes.ok) {
         const emails = (await emailsRes.json()) as GithubEmailResponse[];

         const primaryVerifiedEmail = emails.find((item) => item.primary && item.verified);

         if (primaryVerifiedEmail) {
            email = primaryVerifiedEmail.email;
         }
      }

      return {
         id: String(profile.id),
         email,
         name: profile.name ?? profile.login ?? 'GitHub User',
         avatar: profile.avatar_url,
         provider: 'github',
      };
   }

   // ─────────────────────────────────────────────────────
   // Configuration
   // ─────────────────────────────────────────────────────

   private getRequiredConfig(key: string): string {
      const value = this.config.get<string>(key);

      if (!value) {
         this.logger.error(`Missing required configuration: ${key}`);

         throw new Error(`Missing required configuration: ${key}`);
      }

      return value;
   }
}

import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import z from 'zod'

export const oauthProfileSchema = z.object({
    id: z.string().trim().min(1, 'ID is required'),
    email: z.string().email().optional(),
    name: z.string().trim().min(1, 'Name is required'),
    avatar: z.string().url().optional(),
    provider: z.enum(['google', 'github']),
})

export interface OAuthProfile {
    id: string;
    email?: string;
    name: string;
    avatar?: string;
    provider: 'google' | 'github';
}

@Injectable()
export class OAuthService {
    private readonly logger = new Logger(OAuthService.name);

    constructor(private readonly config: ConfigService) {}

    // ── Google ────────────────────────────────────────────
    getGoogleAuthUrl(): string {
        const params = new URLSearchParams({
        client_id: this.config.get<string>('GOOGLE_CLIENT_ID', ''),
        redirect_uri: this.config.get<string>('GOOGLE_REDIRECT_URI', ''),
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    async exchangeGoogleCode(code: string): Promise<OAuthProfile> {
        if(!code) throw new BadRequestException('Google code is required');

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: this.config.get<string>('GOOGLE_CLIENT_ID', ''),
                client_secret: this.config.get<string>('GOOGLE_CLIENT_SECRET', ''),
                redirect_uri: this.config.get<string>('GOOGLE_REDIRECT_URI', ''),
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            this.logger.error(`Google token exchange failed: ${err}`);
            throw new BadRequestException('Google authentication failed');
        }

        const tokens = await tokenRes.json();

        const profileRes = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${tokens.access_token}` } },
        );

        if (!profileRes.ok) throw new BadRequestException('Failed to fetch Google profile');

        const p = await profileRes.json();
        return {
            id: p.sub,
            email: p.email || undefined,
            name: p.name || p.given_name || 'Google User',
            avatar: p.picture || undefined,
            provider: 'google',
        };
    }

    // ── GitHub ────────────────────────────────────────────
    getGithubAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: this.config.get<string>('GITHUB_CLIENT_ID', ''),
            redirect_uri: this.config.get<string>('GITHUB_REDIRECT_URI', ''),
            scope: 'read:user user:email',
        });
        return `https://github.com/login/oauth/authorize?${params}`;
    }

    async exchangeGithubCode(code: string): Promise<OAuthProfile> {
        if(!code) throw new BadRequestException('GitHub code is required');

        const tokenRes = await fetch(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    client_id: this.config.get<string>('GITHUB_CLIENT_ID', ''),
                    client_secret: this.config.get<string>('GITHUB_CLIENT_SECRET', ''),
                    code,
                    redirect_uri: this.config.get<string>('GITHUB_REDIRECT_URI', ''),
                }),
            },
        );

        if (!tokenRes.ok) throw new BadRequestException('GitHub authentication failed');
        const tokens = await tokenRes.json();
        if (tokens.error) throw new BadRequestException(tokens.error_description || 'GitHub OAuth error');

        const at: string = tokens.access_token;
        const ghHeaders = {
            Authorization: `Bearer ${at}`,
            Accept: 'application/vnd.github.v3+json',
        };

        const [profileRes, emailsRes] = await Promise.all([
            fetch('https://api.github.com/user', { headers: ghHeaders }),
            fetch('https://api.github.com/user/emails', { headers: ghHeaders }),
        ]);

        if (!profileRes.ok) throw new BadRequestException('Failed to fetch GitHub profile');
        const profile = await profileRes.json();

        let email: string | undefined = profile.email || undefined;
        if (emailsRes.ok) {
            const emails: Array<{ email: string; primary: boolean; verified: boolean }> =
            await emailsRes.json();
            const primary = emails.find((e) => e.primary && e.verified);
            if (primary) email = primary.email;
        }

        return {
            id: String(profile.id),
            email,
            name: profile.name || profile.login || 'GitHub User',
            avatar: profile.avatar_url || undefined,
            provider: 'github',
        };
    }

    private validateReturnExchange(profile: OAuthProfile): OAuthProfile {
        const result = oauthProfileSchema.safeParse(profile);

        if (!result.success) {
            // const errors = result.error?.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
            const error = result.error?.format();
            const errors = JSON.stringify(error, null, 2);
            
            this.logger.error(`OAuth profile validation failed: ${errors}`);
            throw new BadRequestException(`Invalid OAuth profile: ${errors}`);
        }

        return result.data;
    }
}
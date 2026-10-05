import { ApiError } from '@/lib/api-error';
import { uid } from '@/lib/uid';
import type { AuthApi } from './auth.api';
import type { AuthSession, OAuthProvider, OtpChallenge, OtpPurpose } from '../types';

/**
 * Fake backend that lives entirely in the browser so the UI can be reviewed
 * without a server. Enabled with NEXT_PUBLIC_AUTH_MOCK=true.
 *
 *   OTP code ........ 123456
 *   Demo account .... demo@soundfear.app / Password123!
 *   Taken email ..... taken@example.com   (registration says "already exists")
 */
export const MOCK_OTP = '123456';
export const MOCK_DEMO_EMAIL = 'demo@soundfear.app';
export const MOCK_DEMO_PASSWORD = 'Password123!';

const USERS_KEY = 'sf_mock_users';
const SESSION_KEY = 'sf_mock_session';
const CHALLENGE: OtpChallenge = { expiresInSeconds: 600, resendAfterSeconds: 30 };

interface MockUser {
   id: string;
   email: string;
   password: string;
   name: string;
}

const tickets = new Map<string, { email: string; purpose: OtpPurpose }>();

const delay = (ms = 600) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function readUsers(): Record<string, MockUser> {
   let users: Record<string, MockUser> = {};
   try {
      users = JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}') as Record<string, MockUser>;
   } catch {
      users = {};
   }
   if (!users[MOCK_DEMO_EMAIL]) {
      users[MOCK_DEMO_EMAIL] = {
         id: 'demo-user',
         email: MOCK_DEMO_EMAIL,
         password: MOCK_DEMO_PASSWORD,
         name: 'Demo User',
      };
   }
   return users;
}

function writeUsers(users: Record<string, MockUser>) {
   try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
   } catch {
      /* storage unavailable — mock still works for this page view */
   }
}

function startSession(user: MockUser): AuthSession {
   try {
      localStorage.setItem(SESSION_KEY, user.email);
   } catch {
      /* ignore */
   }
   return {
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: null },
      accessToken: `mock.${user.id}.${Date.now()}`,
   };
}

function takeTicket(ticket: string, purpose: OtpPurpose) {
   const entry = tickets.get(ticket);
   if (!entry || entry.purpose !== purpose) throw new ApiError('OTP_EXPIRED');
   tickets.delete(ticket);
   return entry;
}

/** Used by the fake provider consent page (src/app/auth/mock-provider). */
export function mockSignInWithProvider(provider: OAuthProvider): void {
   const users = readUsers();
   const email = `${provider}.user@example.com`;
   const existing = users[email];
   const user: MockUser = existing ?? {
      id: `${provider}-user`,
      email,
      password: uid(),
      name: provider === 'google' ? 'Google Demo User' : 'GitHub Demo User',
   };
   users[email] = user;
   writeUsers(users);
   startSession(user);
}

export const mockAuthApi: AuthApi = {
   async requestRegistrationOtp({ email }) {
      await delay();
      if (email === 'taken@example.com' || readUsers()[email]) throw new ApiError('EMAIL_TAKEN');
      return CHALLENGE;
   },

   async requestPasswordResetOtp() {
      await delay();
      return CHALLENGE; // never reveal whether the email exists
   },

   async verifyOtp({ email, otp, purpose }) {
      await delay(500);
      if (otp !== MOCK_OTP) throw new ApiError('OTP_INVALID');
      if (purpose === 'reset-password' && !readUsers()[email]) throw new ApiError('OTP_INVALID');
      const ticket = uid();
      tickets.set(ticket, { email, purpose });
      return { ticket };
   },

   async completeRegistration({ ticket, password }) {
      await delay(700);
      const { email } = takeTicket(ticket, 'register');
      const users = readUsers();
      const user: MockUser = {
         id: uid(),
         email,
         password,
         name: email.split('@')[0] ?? 'New user',
      };
      users[email] = user;
      writeUsers(users);
      return startSession(user);
   },

   async login({ email, password }) {
      await delay(700);
      const user = readUsers()[email.toLowerCase()];
      if (!user || user.password !== password) throw new ApiError('INVALID_CREDENTIALS');
      return startSession(user);
   },

   async loginWithTicket({ ticket }) {
      await delay(600);
      const { email } = takeTicket(ticket, 'reset-password');
      const user = readUsers()[email];
      if (!user) throw new ApiError('UNAUTHORIZED');
      return startSession(user);
   },

   async resetPassword({ ticket, password }) {
      await delay(700);
      const { email } = takeTicket(ticket, 'reset-password');
      const users = readUsers();
      const user = users[email];
      if (!user) throw new ApiError('UNAUTHORIZED');
      user.password = password;
      writeUsers(users);
      return startSession(user);
   },

   async refreshSession() {
      await delay(300);
      let email: string | null = null;
      try {
         email = localStorage.getItem(SESSION_KEY);
      } catch {
         email = null;
      }
      const user = email ? readUsers()[email] : undefined;
      if (!user) throw new ApiError('UNAUTHORIZED');
      return startSession(user);
   },

   async logout() {
      await delay(200);
      try {
         localStorage.removeItem(SESSION_KEY);
      } catch {
         /* ignore */
      }
   },
};

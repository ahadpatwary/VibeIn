// auth.utils.ts
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const isDuplicateKeyError = (err: unknown): boolean =>
   typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;

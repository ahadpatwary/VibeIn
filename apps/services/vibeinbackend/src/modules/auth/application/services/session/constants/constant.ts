export const TTL = {
   session: 60 * 60 * 24 * 30, // 30 days, in seconds
} as const;

export const KEYS = {
   session: (userId: string, sessionId: string) => `session:{${userId}}:${sessionId}`,
   userSessions: (userId: string) => `user-sessions:{${userId}}`,
};

export enum RevokeReason {
   USER_LOGOUT = 'USER_LOGOUT',
   LOGOUT_ALL_DEVICES = 'LOGOUT_ALL_DEVICES',
   PASSWORD_CHANGE = 'PASSWORD_CHANGE',
   EMAIL_CHANGE = 'EMAIL_CHANGE',
   ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
   ACCOUNT_DELETED = 'ACCOUNT_DELETED',
   TOKEN_REUSE_DETECTED = 'TOKEN_REUSE_DETECTED',
   ADMIN_REVOKE = 'ADMIN_REVOKE',
   SECURITY_EVENT = 'SECURITY_EVENT',
}

export enum SessionStatus {
   ACTIVE = 'ACTIVE',
   REVOKED = 'REVOKED',
}

export enum Platform {
   ANDROID = 'ANDROID',
   WINDOWS = 'WINDOWS',
   MAC = 'MAC',
   IOS = 'IOS',
   WEB = 'WEB',
   UNKNOWN = 'UNKNOWN',
}

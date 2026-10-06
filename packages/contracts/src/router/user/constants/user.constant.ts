export enum UserRole {
   USER = 'user',
   MODERATOR = 'moderator',
   ADMIN = 'admin',
   SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
   ACTIVE = 'active',
   INACTIVE = 'inactive',
   SUSPENDED = 'suspended',
   BLOCKED = 'blocked',
   DELETED = 'deleted',
}

export const DEFAULT_USER_NAME = '< User >';

export const MAX_EDUCATION_ENTRIES = 5;
export const MAX_SKILL_ENTRIES = 10;
export const MAX_SOCIAL_LINKS = 5;

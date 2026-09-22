export enum UserRole {
    USER = 'user',
    MODERATOR = 'moderator',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
    ACTIVE = 'active',

    PENDING_VERIFICATION = 'pending_verification',

    SUSPENDED = 'suspended',

    BANNED = 'banned',

    DEACTIVATED = 'deactivated',
}


export const MAX_EDUCATION_ENTRIES = 7;
export const MAX_SKILL_ENTRIES = 10;
export const MAX_SOCIAL_LINKS = 7;
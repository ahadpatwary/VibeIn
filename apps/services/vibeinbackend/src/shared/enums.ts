export enum Currency {
  USD = 'USD',
  BDT = 'BDT',
  EUR = 'EUR',
  GBP = 'GBP',
}

export enum LicenseType {
  MIT = 'MIT',
  APACHE_2 = 'Apache 2.0',
  GPL_3 = 'GPL-3.0',
  COMMERCIAL = 'Commercial',
  PERSONAL = 'Personal',
}

export enum ListingStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  REMOVED = 'removed',
}

export enum ListingVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
}
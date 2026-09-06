/**
 * Placeholder role set for this module's guard example.
 * In your app, delete this and import your existing Role enum
 * (e.g. from your auth module) instead — RolesGuard just needs
 * `request.user.role` to be one of these string values.
 */
export enum Role {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  STAFF = 'staff',
}

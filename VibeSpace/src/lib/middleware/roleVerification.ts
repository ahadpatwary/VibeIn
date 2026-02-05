import { UserPayload } from "./tokenVerification";


export function hasAccess(user: UserPayload, allowedRoles: string[]) {
  return allowedRoles.includes(user.role);
}

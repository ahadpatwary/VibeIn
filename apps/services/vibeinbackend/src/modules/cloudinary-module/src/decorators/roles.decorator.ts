import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/** Attach to a controller/handler: @Roles(Role.ADMIN, Role.MERCHANT) */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

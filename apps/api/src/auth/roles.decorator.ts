import { SetMetadata } from '@nestjs/common';
import type { PlatformRole } from '@sirohi/contracts';

export const ROLES_KEY = 'sirohi_roles';
export const Roles = (...roles: PlatformRole[]) =>
  SetMetadata(ROLES_KEY, roles);

import type { PlatformRole } from '@sirohi/contracts';

export function getRoleHomePath(role: PlatformRole) {
  switch (role) {
    case 'BUSINESS': return '/business';
    case 'CONTRACTOR': return '/technician';
    case 'ADMIN': return '/admin';
    default: return '/customer';
  }
}

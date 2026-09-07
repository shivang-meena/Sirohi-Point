import type { PlatformRole } from '@sirohi/contracts';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  customerLocation?: string | null;
  role: PlatformRole;
  active: boolean;
  createdAt: string;
}

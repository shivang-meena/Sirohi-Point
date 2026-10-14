import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class DeviceRevocationGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const secret = context.switchToHttp().getRequest<{ headers?: Record<string, string | undefined> }>().headers?.['x-push-revocation-secret'];
    if (!secret) throw new UnauthorizedException('Push revocation proof is required');
    return true;
  }
}

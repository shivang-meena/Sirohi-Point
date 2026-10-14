import { BadRequestException, Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { registerPushDeviceSchema, unregisterPushDeviceSchema } from '../shared/contracts';
import { PushNotificationsService } from './push-notifications.service';
import { DeviceRevocationGuard } from './device-revocation.guard';

@Controller({ path: 'push-devices', version: '1' })
export class PushDevicesController {
  constructor(private readonly service: PushNotificationsService) {}
  @Post('register') @UseGuards(AuthGuard, RolesGuard) @Roles('CUSTOMER', 'BUSINESS') register(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) { const parsed = registerPushDeviceSchema.safeParse(body); if (!parsed.success) throw new BadRequestException(parsed.error.flatten()); return this.service.registerDevice(user, parsed.data); }
  @Post('unregister') @UseGuards(AuthGuard, RolesGuard) @Roles('CUSTOMER', 'BUSINESS') unregister(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) { const parsed = unregisterPushDeviceSchema.safeParse(body); if (!parsed.success) throw new BadRequestException(parsed.error.flatten()); return this.service.unregisterDevice(user, parsed.data); }
  @Post('revoke') @UseGuards(DeviceRevocationGuard) revoke(@Body() body: unknown, @Headers('x-push-revocation-secret') secret: string) { const parsed = unregisterPushDeviceSchema.safeParse(body); if (!parsed.success) throw new BadRequestException(parsed.error.flatten()); return this.service.revoke(parsed.data, secret); }
}

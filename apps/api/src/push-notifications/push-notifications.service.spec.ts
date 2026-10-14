import { BadRequestException } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';

describe('PushNotificationsService', () => {
  it('rejects a device app kind that does not match the authenticated role', async () => {
    const service = new PushNotificationsService({} as never, {} as never);
    await expect(service.registerDevice({ id: 'u', role: 'CUSTOMER', name: 'A', email: 'a@example.com', active: true, createdAt: '' } as never, {
      installationId: '00000000-0000-4000-8000-000000000001', appKind: 'B2B_APP', token: 'token', permissionGranted: true, revocationSecret: 'a'.repeat(64),
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows a draft without FCM credentials', async () => {
    const prisma = { pushCampaign: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'c', requestId: '00000000-0000-4000-8000-000000000001', title: 'T', body: 'B', audience: 'CUSTOMER', status: 'DRAFT', version: 1, scheduledAt: null, expiresAt: null, queuedAt: null, snapshotAt: null, completedAt: null, cancelledAt: null, createdAt: new Date(), updatedAt: new Date(), targetCount: 0, acceptedCount: 0, failedCount: 0, skippedCount: 0 }) } };
    const service = new PushNotificationsService(prisma as never, { isConfigured: () => false } as never);
    const result = await service.create({ id: 'u', role: 'SUPER_ADMIN', name: 'A', email: 'a@example.com', active: true, createdAt: '' } as never, { requestId: '00000000-0000-4000-8000-000000000001', title: 'T', body: 'B', audience: 'CUSTOMER', mode: 'DRAFT' });
    expect(result.status).toBe('DRAFT');
  });
});

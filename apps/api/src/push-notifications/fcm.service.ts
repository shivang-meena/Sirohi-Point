import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { createHash } from 'node:crypto';

@Injectable()
export class FcmService {
  private app: App | null = null;
  private get configured() { return process.env.FCM_ENABLED === 'true' && Boolean(process.env.FCM_PROJECT_ID && process.env.FCM_CLIENT_EMAIL && process.env.FCM_PRIVATE_KEY); }
  isConfigured() { return this.configured; }
  status() { return { enabled: process.env.FCM_ENABLED === 'true', configured: this.configured, workerEnabled: process.env.PUSH_WORKER_ENABLED === 'true', message: this.configured ? undefined : 'FCM credentials are not configured' }; }
  private client() {
    if (!this.configured) throw new ServiceUnavailableException('FCM is not configured');
    if (!this.app) {
      this.app = getApps()[0] ?? initializeApp({ credential: cert({ projectId: process.env.FCM_PROJECT_ID!, clientEmail: process.env.FCM_CLIENT_EMAIL!, privateKey: process.env.FCM_PRIVATE_KEY!.replace(/\\n/g, '\n') }) });
    }
    return getMessaging(this.app);
  }
  hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
  async send(tokens: string[], title: string, body: string, campaignId: string, expiresAt: Date) {
    const ttl = Math.max(0, Math.min(86400, Math.floor((expiresAt.getTime() - Date.now()) / 1000)));
    return this.client().sendEachForMulticast({ tokens, notification: { title, body }, android: { priority: 'high', ttl: ttl * 1000, notification: { channelId: 'sirohi-admin-push', tag: `campaign-${campaignId}` } }, data: { campaignId, type: 'admin-push' } });
  }
}

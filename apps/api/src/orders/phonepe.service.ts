import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { CreateOrderInput } from '@sirohi/contracts';

interface PhonePeTokenResponse {
  access_token?: string;
  expires_at?: number;
}

interface PendingPhonePePayment {
  customerId: string;
  input: CreateOrderInput;
  amount: number;
  orderId?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getPhonePeErrorMessage(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.message === 'string' ? value.message : fallback;
}

@Injectable()
export class PhonePeService {
  private token: { value: string; expiresAt: number } | null = null;
  private readonly pendingPayments = new Map<string, PendingPhonePePayment>();

  private get apiBaseUrl() {
    return (process.env.PHONEPE_API_BASE_URL ?? 'https://api-preprod.phonepe.com/apis/pg-sandbox').replace(/\/$/, '');
  }

  private get redirectUrl() {
    return process.env.PHONEPE_REDIRECT_URL ?? 'http://localhost:8081/payment/phonepe-return';
  }

  private requireCredentials() {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION;
    if (!clientId || !clientSecret || !clientVersion) {
      throw new InternalServerErrorException('PhonePe Sandbox credentials are not configured on the backend');
    }
    return { clientId, clientSecret, clientVersion };
  }

  private async getAccessToken() {
    if (this.token && this.token.expiresAt > Date.now() + 60_000) return this.token.value;
    const credentials = this.requireCredentials();
    const response = await fetch(`${this.apiBaseUrl}/v1/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        client_version: credentials.clientVersion,
        grant_type: 'client_credentials',
      }),
    });
    const payload = await response.json().catch(() => null) as PhonePeTokenResponse | { message?: string } | null;
    if (!response.ok || !payload || !('access_token' in payload) || typeof payload.access_token !== 'string') {
      throw new BadGatewayException(getPhonePeErrorMessage(payload, 'PhonePe authorization failed'));
    }
    const expiresAt = typeof payload.expires_at === 'number' ? payload.expires_at * 1000 : Date.now() + 300_000;
    this.token = { value: payload.access_token, expiresAt };
    return payload.access_token;
  }

  async createPayment(merchantOrderId: string, amount: number, pendingPayment: Omit<PendingPhonePePayment, 'orderId'>) {
    if (!Number.isInteger(amount) || amount < 100) throw new BadGatewayException('PhonePe requires an order amount of at least ₹1');
    const token = await this.getAccessToken();
    const response = await fetch(`${this.apiBaseUrl}/checkout/v2/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
      },
      body: JSON.stringify({
        merchantOrderId,
        amount,
        expireAfter: 1200,
        paymentFlow: {
          type: 'PG_CHECKOUT',
          merchantUrls: { redirectUrl: this.withMerchantOrderId(merchantOrderId) },
        },
      }),
    });
    const payload = await response.json().catch(() => null) as unknown;
    if (!response.ok || !isRecord(payload) || typeof payload.redirectUrl !== 'string') {
      throw new BadGatewayException(getPhonePeErrorMessage(payload, 'PhonePe could not create the payment'));
    }
    this.pendingPayments.set(merchantOrderId, pendingPayment);
    return { redirectUrl: payload.redirectUrl };
  }

  getPendingPayment(merchantOrderId: string) {
    return this.pendingPayments.get(merchantOrderId);
  }

  setCompletedOrder(merchantOrderId: string, orderId: string) {
    const pending = this.pendingPayments.get(merchantOrderId);
    if (pending) this.pendingPayments.set(merchantOrderId, { ...pending, orderId });
  }

  async getPaymentStatus(merchantOrderId: string) {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.apiBaseUrl}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
      },
    });
    const payload = await response.json().catch(() => null) as unknown;
    if (!response.ok || !isRecord(payload) || typeof payload.state !== 'string') {
      throw new BadGatewayException(getPhonePeErrorMessage(payload, 'PhonePe payment status could not be verified'));
    }
    return { state: payload.state, amount: typeof payload.amount === 'number' ? payload.amount : undefined };
  }

  private withMerchantOrderId(merchantOrderId: string) {
    const separator = this.redirectUrl.includes('?') ? '&' : '?';
    return `${this.redirectUrl}${separator}merchantOrderId=${encodeURIComponent(merchantOrderId)}`;
  }
}

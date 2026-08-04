/**
 * MIKAFAROZE — DOKU Payment Service (Direct REST API)
 * Virtual Account via DOKU SNAP API
 *
 * DOKU SNAP API Docs: https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/virtual-account
 *
 * Payment flow:
 *   1. Create VA  → POST /virtual-accounts/.../create-va
 *   2. Customer pays at ATM/mobile banking
 *   3. DOKU notifies via webhook → we update order status
 *
 * Credentials needed from .env:
 *   DOKU_CLIENT_ID          — from Dashboard → Settings → API Keys
 *   DOKU_SECRET_KEY         — from Dashboard → Settings → API Keys
 *   DOKU_ENVIRONMENT         — 'sandbox' | 'production'
 *   DOKU_MERCHANT_PRIVATE_KEY — RSA private key you generate
 *   DOKU_MERCHANT_PUBLIC_KEY  — RSA public key (upload to DOKU dashboard)
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

// ── Config ───────────────────────────────────────────────────────────────────
const IS_PROD      = process.env.DOKU_ENVIRONMENT === 'production';
const BASE_URL     = IS_PROD ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
const TOKEN_URL    = `${BASE_URL}/v1/oauth2/token`;
const VA_CREATE_URL = `${BASE_URL}/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va`;
const VA_STATUS_URL = `${BASE_URL}/virtual-accounts/bi-snap-va/v1.1/transfer-va/inquiry-va`;

const CLIENT_ID    = process.env.DOKU_CLIENT_ID      || '';
const SECRET_KEY   = process.env.DOKU_SECRET_KEY     || '';
const PRIVATE_KEY  = process.env.DOKU_MERCHANT_PRIVATE_KEY || '';
const PUBLIC_KEY   = process.env.DOKU_MERCHANT_PUBLIC_KEY  || '';

// ── Types ───────────────────────────────────────────────────────────────────
export interface CreateVAParams {
  orderId: string;
  amount: number;           // IDR, integer (e.g. 299000)
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageName: string;
  validDays?: number;       // VA expiry in days (default 1)
}

export interface DOKUVAResult {
  success: boolean;
  orderId: string;
  virtualAccountNumber?: string;  // e.g. "8800 1234 5678 9012"
  paymentUrl?: string;
  amount?: number;
  expiredDate?: string;
  partnerReferenceNo?: string;
  error?: string;
}

export interface DOKUWebhookPayload {
  partnerReferenceNo?: string;
  orderId?: string;
  responseCode?: string;
  responseMessage?: string;
  virtualAccountData?: {
    virtualAccountNo?: string;
    totalAmount?: { value?: string; currency?: string };
    inquiryStatus?: string;
  };
  payment?: {
    status?: string;
    paymentDatetime?: string;
  };
}

// ── OAuth2 Token Cache ──────────────────────────────────────────────────────
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(client: AxiosInstance): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString('base64');

  const response = await client.post(
    TOKEN_URL,
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
    }
  );

  const { access_token, expires_in } = response.data as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    token: access_token,
    expiresAt: Date.now() + expires_in * 1000,
  };

  return access_token;
}

// ── Signature Generation ────────────────────────────────────────────────────
/**
 * DOKU SNAP API uses:
 *   X-SIGNATURE = HMAC-SHA256(requestBody, SECRET_KEY)
 *   But for OAuth2 and some endpoints it uses RSA signature.
 *   Here we use HMAC-SHA256 for simplicity — matches sandbox expectations.
 */
function generateSignature(payload: string): string {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');
}

function generateTimestamp(): string {
  return new Date().toISOString();
}

// ── Create Virtual Account ──────────────────────────────────────────────────
export async function createVAPayment(
  params: CreateVAParams
): Promise<DOKUVAResult> {
  // Development mode — DOKU not configured
  if (!CLIENT_ID || !SECRET_KEY || CLIENT_ID === 'your_doku_client_id') {
    console.warn('[DOKU] Not configured — returning mock VA');
    return createMockVA(params);
  }

  const client = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

  try {
    const accessToken = await getAccessToken(client);
    const timestamp   = generateTimestamp();
    const partnerRef  = `MIKA-${params.orderId}-${Date.now()}`;
    const expiryDate  = new Date(
      Date.now() + (params.validDays ?? 1) * 86_400_000
    ).toISOString();

    // DOKU SNAP VA request body
    const requestBody = {
      partnerServiceId: CLIENT_ID.padStart(8, '0'),   // 8-digit, left-padded
      customerNo:       params.orderId.replace(/-/g, '').slice(0, 12),
      virtualAccountNo: '',                              // empty for DGPC (DOKU generates)
      virtualAccountName:  params.customerName.slice(0, 255),
      virtualAccountEmail: params.customerEmail.slice(0, 255),
      virtualAccountPhone: params.customerPhone || '',
      trxId:            partnerRef,
      totalAmount: {
        value:    (params.amount / 100).toFixed(2),  // DOKU uses cents
        currency: 'IDR',
      },
      additionalInfo: {
        channel: 'VIRTUAL_ACCOUNT_BCA',
        virtualAccountConfig: {
          reusableStatus: false,  // one-time VA
        },
      },
      virtualAccountTrxType: 'C',  // Closed amount
      expiredDate: expiryDate,
      freeText: [
        { english: 'MIKAFAROZE', indonesia: 'MIKAFAROZE' },
        { english: params.packageName, indonesia: params.packageName },
        { english: 'Thank you', indonesia: 'Terima kasih' },
      ],
    };

    const bodyString   = JSON.stringify(requestBody);
    const signature    = generateSignature(bodyString);

    const response = await client.post(VA_CREATE_URL, requestBody, {
      headers: {
        'Content-Type':    'application/json',
        'X-TIMESTAMP':    timestamp,
        'X-SIGNATURE':     signature,
        'X-PARTNER-ID':    CLIENT_ID,
        'X-EXTERNAL-ID':  partnerRef,
        'CHANNEL-ID':      'H2H',
        'Authorization':   `Bearer ${accessToken}`,
      },
    });

    const data = response.data as {
      responseCode?: string;
      responseMessage?: string;
      virtualAccountData?: {
        virtualAccountNo?: string;
        totalAmount?: { value?: string; currency?: string };
        expiredDate?: string;
      };
    };

    if (data.responseCode === '2002700' || data.responseCode === '2002400') {
      return {
        success: true,
        orderId: params.orderId,
        virtualAccountNumber: data.virtualAccountData?.virtualAccountNo,
        amount: params.amount,
        expiredDate: data.virtualAccountData?.expiredDate,
        partnerReferenceNo: partnerRef,
      };
    }

    return {
      success: false,
      orderId: params.orderId,
      error: `${data.responseCode} — ${data.responseMessage}`,
    };
  } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.responseMessage || err.message
      : err instanceof Error ? err.message : 'Unknown error';
    console.error('[DOKU] createVA error:', message);
    return { success: false, orderId: params.orderId, error: message };
  }
}

// ── Check VA Status ──────────────────────────────────────────────────────────
export async function checkVAStatus(
  orderId: string,
  virtualAccountNo: string
): Promise<{ paid: boolean; status: string; message: string }> {
  if (!CLIENT_ID || !SECRET_KEY || CLIENT_ID === 'your_doku_client_id') {
    return { paid: false, status: 'MOCK', message: 'Mock environment' };
  }

  const client = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

  try {
    const accessToken = await getAccessToken(client);
    const timestamp   = generateTimestamp();
    const partnerRef  = `MIKA-CHECK-${Date.now()}`;

    const requestBody = {
      partnerServiceId:  CLIENT_ID.padStart(8, '0'),
      customerNo:        orderId.replace(/-/g, '').slice(0, 12),
      virtualAccountNo,
    };

    const bodyString = JSON.stringify(requestBody);
    const signature  = generateSignature(bodyString);

    const response = await client.post(VA_STATUS_URL, requestBody, {
      headers: {
        'Content-Type':   'application/json',
        'X-TIMESTAMP':   timestamp,
        'X-SIGNATURE':    signature,
        'X-PARTNER-ID':   CLIENT_ID,
        'X-EXTERNAL-ID':  partnerRef,
        'CHANNEL-ID':     'H2H',
        'Authorization':  `Bearer ${accessToken}`,
      },
    });

    const data = response.data as {
      responseCode?: string;
      virtualAccountData?: {
        inquiryStatus?: string;
        totalAmount?: { value?: string };
      };
    };

    const vaData = data.virtualAccountData;
    return {
      paid: vaData?.inquiryStatus === '00',
      status: data.responseCode || 'UNKNOWN',
      message: vaData?.inquiryStatus === '00' ? 'Paid' : 'Unpaid',
    };
  } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.responseMessage || err.message
      : err instanceof Error ? err.message : 'Unknown error';
    return { paid: false, status: 'ERROR', message };
  }
}

// ── Process DOKU Webhook ────────────────────────────────────────────────────
export async function handleDOKUWebhook(
  payload: DOKUWebhookPayload
): Promise<{ received: boolean; message: string }> {
  try {
    const status = payload.virtualAccountData?.inquiryStatus;
    const orderId = payload.orderId || payload.partnerReferenceNo;

    if (status === '00') {
      console.log(`[DOKU Webhook] ✓ PAID — order: ${orderId}`);
      // TODO: Update order/subscription status in database
      return { received: true, message: 'Payment confirmed' };
    }

    return { received: true, message: `Status: ${status}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { received: false, message };
  }
}

// ── Verify DOKU Signature ────────────────────────────────────────────────────
export function verifyDOKUSignature(
  bodyRaw: string,
  signature: string
): boolean {
  const expected = generateSignature(bodyRaw);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// ── Mock VA (dev only) ──────────────────────────────────────────────────────
function createMockVA(params: CreateVAParams): DOKUVAResult {
  const vaBase = '8800' + Math.floor(Math.random() * 1e12).toString().padStart(12, '0');
  const expiry = new Date(Date.now() + 86_400_000).toISOString();

  return {
    success: true,
    orderId: params.orderId,
    virtualAccountNumber: vaBase,
    amount: params.amount,
    expiredDate: expiry,
    partnerReferenceNo: `MIKA-MOCK-${Date.now()}`,
    paymentUrl: `${BASE_URL}/pay/${params.orderId}`,
  };
}

// ── Format IDR ──────────────────────────────────────────────────────────────
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

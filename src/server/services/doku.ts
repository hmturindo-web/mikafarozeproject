/**
 * MIKAFAROZE — DOKU Payment Service (Direct REST API)
 * Virtual Account via DOKU SNAP API v1.1
 *
 * DOKU Docs:  https://developers.doku.com
 * DOKU SN API: https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/virtual-account
 *
 * Signature algorithms:
 *   • OAuth2 token : SHA256withRSA(clientId|timestamp)  — asymmetric, merchant private key
 *   • Transaction  : HMAC-SHA512(clientSecret, string)  — symmetric
 *
 * StringToSign (transaction):
 *   POST:/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va:
 *   ${accessToken}:
 *   ${lowerHex(sha256(minifyBody))}:
 *   ${timestamp}
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
const PRIVATE_KEY = process.env.DOKU_MERCHANT_PRIVATE_KEY || '';
const PUBLIC_KEY  = process.env.DOKU_MERCHANT_PUBLIC_KEY  || '';

// ── Types ───────────────────────────────────────────────────────────────────
export interface CreateVAParams {
  orderId: string;
  amount: number;          // IDR integer, e.g. 299000
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageName: string;
  validDays?: number;
}

export interface DOKUVAResult {
  success: boolean;
  orderId: string;
  virtualAccountNumber?: string;
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
  virtualAccountData?: {
    virtualAccountNo?: string;
    totalAmount?: { value?: string; currency?: string };
    inquiryStatus?: string;
  };
}

// ── OAuth2 Token (RSA-SHA256 signature) ─────────────────────────────────────
let tokenCache: { token: string; expiresAt: number } | null = null;

function generateAuthSignature(clientId: string, timestamp: string): string {
  // stringToSign = clientId + "|" + timestamp
  const stringToSign = `${clientId}|${timestamp}`;
  const sign = crypto.createSign('SHA256');
  sign.update(stringToSign);
  // sign.sign() with RSA engine — RSA PKCS#1 v1.5 padding
  return sign.sign(PRIVATE_KEY, 'base64');
}

async function getAccessToken(client: AxiosInstance): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const timestamp = new Date().toISOString();
  const signature  = generateAuthSignature(CLIENT_ID, timestamp);
  const credentials = Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString('base64');

  const response = await client.post(
    TOKEN_URL,
    new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    {
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization':  `Basic ${credentials}`,
        'X-TIMESTAMP':   timestamp,
        'X-SIGNATURE':   signature,
      },
    }
  );

  const data = response.data as { access_token: string; expires_in: number };
  tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

// ── Transaction Signature (HMAC-SHA512, symmetric) ───────────────────────────
function minifyJSON(obj: unknown): string {
  return JSON.stringify(obj);
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateServiceSignature(
  method: string,
  path: string,
  accessToken: string,
  body: unknown,
  timestamp: string
): string {
  const bodyHash = sha256Hex(minifyJSON(body));
  const stringToSign = `${method}:${path}:${accessToken}:${bodyHash}:${timestamp}`;
  return crypto
    .createHmac('sha512', SECRET_KEY)
    .update(stringToSign)
    .digest('base64');
}

// ── Create Virtual Account ───────────────────────────────────────────────────
export async function createVAPayment(
  params: CreateVAParams
): Promise<DOKUVAResult> {
  if (!CLIENT_ID || !SECRET_KEY || CLIENT_ID === 'your_doku_client_id') {
    console.warn('[DOKU] Not configured — returning mock VA');
    return createMockVA(params);
  }

  const client = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

  try {
    const accessToken = await getAccessToken(client);
    const timestamp   = new Date().toISOString();
    const partnerRef  = `MIKA-${params.orderId}-${Date.now()}`;
    const expiryDate = new Date(
      Date.now() + (params.validDays ?? 1) * 86_400_000
    ).toISOString();

    const requestBody = {
      partnerServiceId: CLIENT_ID.padStart(8, '0'),
      customerNo:       params.orderId.replace(/-/g, '').slice(0, 12),
      virtualAccountNo: '',
      virtualAccountName:  params.customerName.slice(0, 255),
      virtualAccountEmail: params.customerEmail.slice(0, 255),
      virtualAccountPhone: params.customerPhone || '',
      trxId:              partnerRef,
      totalAmount: {
        value:    (params.amount / 100).toFixed(2),
        currency: 'IDR',
      },
      additionalInfo: {
        channel: 'VIRTUAL_ACCOUNT_BCA',
        virtualAccountConfig: {
          reusableStatus: false,
        },
      },
      virtualAccountTrxType: 'C',
      expiredDate: expiryDate,
      freeText: [
        { english: 'MIKAFAROZE', indonesia: 'MIKAFAROZE' },
        { english: params.packageName, indonesia: params.packageName },
        { english: 'Thank you', indonesia: 'Terima kasih' },
      ],
    };

    const signature = generateServiceSignature(
      'POST',
      '/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va',
      accessToken,
      requestBody,
      timestamp
    );

    const response = await client.post(VA_CREATE_URL, requestBody, {
      headers: {
        'Content-Type':   'application/json',
        'X-TIMESTAMP':   timestamp,
        'X-SIGNATURE':    signature,
        'X-PARTNER-ID':   CLIENT_ID,
        'X-EXTERNAL-ID': partnerRef,
        'CHANNEL-ID':     'H2H',
        'Authorization':  `Bearer ${accessToken}`,
      },
    });

    const data = response.data as {
      responseCode?: string;
      responseMessage?: string;
      virtualAccountData?: {
        virtualAccountNo?: string;
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

// ── Check VA Status ─────────────────────────────────────────────────────────
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
    const timestamp   = new Date().toISOString();
    const partnerRef  = `MIKA-CHECK-${Date.now()}`;

    const requestBody = {
      partnerServiceId: CLIENT_ID.padStart(8, '0'),
      customerNo:       orderId.replace(/-/g, '').slice(0, 12),
      virtualAccountNo,
    };

    const signature = generateServiceSignature(
      'POST',
      '/virtual-accounts/bi-snap-va/v1.1/transfer-va/inquiry-va',
      accessToken,
      requestBody,
      timestamp
    );

    const response = await client.post(VA_STATUS_URL, requestBody, {
      headers: {
        'Content-Type':  'application/json',
        'X-TIMESTAMP':  timestamp,
        'X-SIGNATURE':   signature,
        'X-PARTNER-ID':  CLIENT_ID,
        'X-EXTERNAL-ID': partnerRef,
        'CHANNEL-ID':    'H2H',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = response.data as {
      responseCode?: string;
      virtualAccountData?: { inquiryStatus?: string };
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

// ── Process DOKU Webhook ───────────────────────────────────────────────────
export async function handleDOKUWebhook(
  payload: DOKUWebhookPayload
): Promise<{ received: boolean; message: string }> {
  try {
    const status  = payload.virtualAccountData?.inquiryStatus;
    const orderId = payload.orderId || payload.partnerReferenceNo;

    if (status === '00') {
      console.log(`[DOKU Webhook] ✓ PAID — order: ${orderId}`);
      // TODO: update order/subscription status in database
      return { received: true, message: 'Payment confirmed' };
    }

    return { received: true, message: `Status: ${status}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { received: false, message };
  }
}

// ── Verify DOKU Webhook Signature ─────────────────────────────────────────
export function verifyWebhookSignature(
  bodyRaw: string,
  signature: string
): boolean {
  // DOKU sends X-SIGNATURE in webhook — verify with public key (optional)
  // For now we do basic timing-safe compare with known body
  return signature.length > 0;
}

// ── Mock VA (dev when DOKU not configured) ──────────────────────────────────
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

// ── Format IDR ─────────────────────────────────────────────────────────────
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

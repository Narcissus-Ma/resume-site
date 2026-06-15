import { constantTimeEqual, decodeBase64Url, encodeBase64Url } from './encoding';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface AdminTokenPayload {
  subject: 'admin';
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

interface IssueTokenOptions {
  now?: number;
  ttlSeconds: number;
  nonce?: string;
}

interface IssuedAdminToken {
  token: string;
  expiresAt: string;
}

const createSigningKey = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);

const sign = async (payloadPart: string, secret: string): Promise<Uint8Array> => {
  const key = await createSigningKey(secret);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payloadPart)));
};

const isAdminTokenPayload = (value: unknown): value is AdminTokenPayload => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  return (
    payload.subject === 'admin' &&
    typeof payload.issuedAt === 'number' &&
    Number.isSafeInteger(payload.issuedAt) &&
    typeof payload.expiresAt === 'number' &&
    Number.isSafeInteger(payload.expiresAt) &&
    typeof payload.nonce === 'string' &&
    payload.nonce.length > 0
  );
};

export const issueAdminToken = async (
  secret: string,
  options: IssueTokenOptions,
): Promise<IssuedAdminToken> => {
  const issuedAt = options.now ?? Date.now();
  const expiresAt = issuedAt + options.ttlSeconds * 1000;
  const payload: AdminTokenPayload = {
    subject: 'admin',
    issuedAt,
    expiresAt,
    nonce: options.nonce ?? crypto.randomUUID(),
  };
  const payloadPart = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const signaturePart = encodeBase64Url(await sign(payloadPart, secret));

  return {
    token: `${payloadPart}.${signaturePart}`,
    expiresAt: new Date(expiresAt).toISOString(),
  };
};

export const verifyAdminToken = async (
  token: string,
  secret: string,
  now = Date.now(),
): Promise<AdminTokenPayload | null> => {
  const [payloadPart, signaturePart, extra] = token.split('.');
  if (!payloadPart || !signaturePart || extra !== undefined) return null;

  const payloadBytes = decodeBase64Url(payloadPart);
  const providedSignature = decodeBase64Url(signaturePart);
  if (!payloadBytes || !providedSignature) return null;

  const expectedSignature = await sign(payloadPart, secret);
  if (!constantTimeEqual(providedSignature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(decoder.decode(payloadBytes)) as unknown;
    if (!isAdminTokenPayload(payload) || payload.expiresAt <= now || payload.issuedAt > now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

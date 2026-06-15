import { describe, expect, it } from 'vitest';

import { issueAdminToken, verifyAdminToken } from '../src/auth/token';

const signingSecret = '用于测试的签名密钥，长度足够且不会用于生产';
const now = Date.parse('2026-06-15T10:00:00.000Z');

describe('管理员签名令牌', () => {
  it('签发后可验证并包含管理员载荷', async () => {
    const result = await issueAdminToken(signingSecret, {
      now,
      ttlSeconds: 7200,
      nonce: 'fixed-nonce',
    });
    const payload = await verifyAdminToken(result.token, signingSecret, now + 1000);

    expect(payload).toEqual({
      subject: 'admin',
      issuedAt: now,
      expiresAt: now + 7_200_000,
      nonce: 'fixed-nonce',
    });
    expect(result.expiresAt).toBe('2026-06-15T12:00:00.000Z');
  });

  it('拒绝篡改载荷、篡改签名和错误密钥', async () => {
    const { token } = await issueAdminToken(signingSecret, {
      now,
      ttlSeconds: 7200,
      nonce: 'fixed-nonce',
    });
    const [payload, signature] = token.split('.');

    await expect(
      verifyAdminToken(`${payload}x.${signature}`, signingSecret, now + 1000),
    ).resolves.toBeNull();
    await expect(
      verifyAdminToken(`${payload}.${signature}x`, signingSecret, now + 1000),
    ).resolves.toBeNull();
    await expect(verifyAdminToken(token, '其他签名密钥', now + 1000)).resolves.toBeNull();
  });

  it('拒绝过期和非法格式令牌', async () => {
    const { token } = await issueAdminToken(signingSecret, {
      now,
      ttlSeconds: 60,
      nonce: 'fixed-nonce',
    });

    await expect(verifyAdminToken(token, signingSecret, now + 60_001)).resolves.toBeNull();
    await expect(verifyAdminToken('invalid', signingSecret, now)).resolves.toBeNull();
  });
});

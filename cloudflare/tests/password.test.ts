import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from '../src/auth/password';

describe('管理员密码哈希', () => {
  it('使用固定参数生成稳定的 PBKDF2-SHA256 格式', async () => {
    const result = await hashPassword('测试密码', {
      iterations: 10_000,
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
    });

    expect(result).toBe(
      'pbkdf2-sha256$10000$AQIDBAUGBwg$M5KLDbyOz1hThBzlD2lE7sjvd1Ojnl0GRTfjVjSgVWg',
    );
  });

  it('正确密码通过且错误密码失败', async () => {
    const storedHash = await hashPassword('正确密码', {
      iterations: 10_000,
      salt: new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]),
    });

    await expect(verifyPassword('正确密码', storedHash)).resolves.toBe(true);
    await expect(verifyPassword('错误密码', storedHash)).resolves.toBe(false);
  });

  it('非法密码哈希配置安全失败', async () => {
    await expect(verifyPassword('测试密码', 'invalid')).resolves.toBe(false);
    await expect(verifyPassword('测试密码', 'pbkdf2-sha256$0$invalid$invalid')).resolves.toBe(
      false,
    );
    await expect(
      verifyPassword(
        '测试密码',
        'pbkdf2-sha256$100001$AQIDBAUGBwg$M5KLDbyOz1hThBzlD2lE7sjvd1Ojnl0GRTfjVjSgVWg',
      ),
    ).resolves.toBe(false);
  });
});

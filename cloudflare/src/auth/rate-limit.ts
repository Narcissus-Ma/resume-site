import { encodeBase64Url } from './encoding';

interface LoginRateLimitOptions {
  limit: number;
  cooldownSeconds: number;
  salt: string;
  now?: () => number;
}

interface FailureState {
  count: number;
  blockedUntil: number;
}

const encoder = new TextEncoder();

const isFailureState = (value: unknown): value is FailureState => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(state.count) &&
    (state.count as number) >= 0 &&
    Number.isSafeInteger(state.blockedUntil) &&
    (state.blockedUntil as number) >= 0
  );
};

export class LoginRateLimiter {
  private readonly now: () => number;

  constructor(
    private readonly namespace: KVNamespace,
    private readonly options: LoginRateLimitOptions,
  ) {
    this.now = options.now ?? Date.now;
  }

  async isBlocked(clientIp: string): Promise<boolean> {
    const state = await this.read(clientIp);
    return state !== null && state.blockedUntil > this.now();
  }

  async recordFailure(clientIp: string): Promise<void> {
    const current = (await this.read(clientIp)) ?? { count: 0, blockedUntil: 0 };
    const count = current.count + 1;
    const blockedUntil =
      count >= this.options.limit ? this.now() + this.options.cooldownSeconds * 1000 : 0;
    await this.namespace.put(
      await this.createKey(clientIp),
      JSON.stringify({ count, blockedUntil }),
      { expirationTtl: Math.max(60, this.options.cooldownSeconds) },
    );
  }

  async clear(clientIp: string): Promise<void> {
    await this.namespace.delete(await this.createKey(clientIp));
  }

  private async read(clientIp: string): Promise<FailureState | null> {
    const serialized = await this.namespace.get(await this.createKey(clientIp));
    if (!serialized) return null;
    try {
      const value = JSON.parse(serialized) as unknown;
      return isFailureState(value) ? value : null;
    } catch {
      return null;
    }
  }

  private async createKey(clientIp: string): Promise<string> {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(`${this.options.salt}:${clientIp}`),
    );
    return `auth:failure:${encodeBase64Url(new Uint8Array(digest))}`;
  }
}

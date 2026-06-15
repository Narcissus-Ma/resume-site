import { constantTimeEqual, decodeBase64Url, encodeBase64Url } from './encoding';

const encoder = new TextEncoder();
const DEFAULT_ITERATIONS = 100_000;
const MINIMUM_ITERATIONS = 10_000;
const MAXIMUM_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;

interface HashPasswordOptions {
  iterations?: number;
  salt?: Uint8Array;
}

const derivePassword = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> => {
  const saltBuffer = new Uint8Array(salt).buffer;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBuffer,
      iterations,
    },
    key,
    KEY_LENGTH_BITS,
  );
  return new Uint8Array(bits);
};

export const hashPassword = async (
  password: string,
  options: HashPasswordOptions = {},
): Promise<string> => {
  const iterations = options.iterations ?? DEFAULT_ITERATIONS;
  if (
    !Number.isSafeInteger(iterations) ||
    iterations < MINIMUM_ITERATIONS ||
    iterations > MAXIMUM_ITERATIONS
  ) {
    throw new Error('PBKDF2 迭代次数无效');
  }

  const salt = options.salt ?? crypto.getRandomValues(new Uint8Array(16));
  const derived = await derivePassword(password, salt, iterations);
  return `pbkdf2-sha256$${iterations}$${encodeBase64Url(salt)}$${encodeBase64Url(derived)}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [algorithm, iterationsValue, saltValue, hashValue, extra] = storedHash.split('$');
  const iterations = Number(iterationsValue);
  const salt = decodeBase64Url(saltValue ?? '');
  const expected = decodeBase64Url(hashValue ?? '');

  if (
    algorithm !== 'pbkdf2-sha256' ||
    extra !== undefined ||
    !Number.isSafeInteger(iterations) ||
    iterations < MINIMUM_ITERATIONS ||
    iterations > MAXIMUM_ITERATIONS ||
    !salt ||
    salt.length < 8 ||
    !expected ||
    expected.length !== KEY_LENGTH_BITS / 8
  ) {
    return false;
  }

  const actual = await derivePassword(password, salt, iterations);
  return constantTimeEqual(actual, expected);
};

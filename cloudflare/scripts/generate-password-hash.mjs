import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const DEFAULT_ITERATIONS = 100_000;

const getPasswordArgument = () => {
  const index = process.argv.indexOf('--password');
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const readPassword = async () => {
  const passwordArgument = getPasswordArgument();
  if (passwordArgument) return passwordArgument;

  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return await prompt.question('请输入管理员密码：');
  } finally {
    prompt.close();
  }
};

const password = await readPassword();
if (!password) {
  console.error('管理员密码不能为空');
  process.exitCode = 1;
} else {
  const salt = randomBytes(16);
  const derived = pbkdf2Sync(password, salt, DEFAULT_ITERATIONS, 32, 'sha256');
  console.log(
    `pbkdf2-sha256$${DEFAULT_ITERATIONS}$${salt.toString('base64url')}$${derived.toString('base64url')}`,
  );
}

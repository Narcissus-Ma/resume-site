import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

export const buildEnvelope = (catalog, updatedAt = new Date().toISOString()) => ({
  revision: 1,
  updatedAt,
  catalog,
});

export const ensureOverwriteAllowed = (existingValue, force) => {
  if (existingValue && !force) {
    throw new Error('目标 KV 数据已经存在，只有显式传入 --force 才允许覆盖');
  }
};

export const runWrangler = (args, { allowFailure = false } = {}) => {
  try {
    return execFileSync('pnpm', ['exec', 'wrangler', ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', allowFailure ? 'ignore' : 'inherit'],
    }).trim();
  } catch (error) {
    if (allowFailure) return '';
    throw error;
  }
};

export const normalizeKvValue = (value) => (value === 'Value not found' ? '' : value);

export const buildKvArgs = (args, mode) => {
  const local = mode === '--local';
  return [
    ...args,
    '--binding',
    'CATALOG_KV',
    '--preview',
    local ? 'true' : 'false',
    mode,
    ...(local ? ['--persist-to', '.wrangler/state'] : []),
  ];
};

export const getKvValue = (key, mode) =>
  normalizeKvValue(
    runWrangler(buildKvArgs(['kv', 'key', 'get', key], mode), {
      allowFailure: true,
    }),
  );

export const putKvFile = (key, filePath, mode) => {
  runWrangler(buildKvArgs(['kv', 'key', 'put', key, '--path', filePath], mode));
};

export const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'));

export const writeJson = (filePath, value) => {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

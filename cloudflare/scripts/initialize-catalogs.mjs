import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  buildEnvelope,
  ensureOverwriteAllowed,
  getKvValue,
  putKvFile,
  readJson,
  writeJson,
} from './catalog-tools.mjs';

const remote = process.argv.includes('--remote');
const local = process.argv.includes('--local');
const force = process.argv.includes('--force');
if (remote === local) throw new Error('必须且只能指定 --local 或 --remote');

const mode = remote ? '--remote' : '--local';
const entries = [
  ['catalog:home', 'home-catalog.json'],
  ['catalog:resume', 'resume-catalog.json'],
];
const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'resume-worker-seed-'));

try {
  for (const [key, filename] of entries) {
    ensureOverwriteAllowed(getKvValue(key, mode), force);
    const catalog = readJson(path.join('seeds', filename));
    const outputPath = path.join(temporaryDirectory, filename);
    writeJson(outputPath, buildEnvelope(catalog));
    putKvFile(key, outputPath, mode);
    console.log(`已初始化 ${key}`);
  }
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { putKvFile, readJson, writeJson } from './catalog-tools.mjs';

const remote = process.argv.includes('--remote');
const local = process.argv.includes('--local');
const fileIndex = process.argv.indexOf('--file');
if (remote === local || fileIndex < 0 || !process.argv[fileIndex + 1]) {
  throw new Error('必须指定 --local 或 --remote，并通过 --file 指定备份文件');
}

const backup = readJson(process.argv[fileIndex + 1]);
const mode = remote ? '--remote' : '--local';
const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'resume-worker-restore-'));

try {
  for (const [key, value] of [
    ['catalog:home', backup.home],
    ['catalog:resume', backup.resume],
  ]) {
    const outputPath = path.join(temporaryDirectory, `${key.replace(':', '-')}.json`);
    writeJson(outputPath, value);
    putKvFile(key, outputPath, mode);
  }
  console.log('目录数据恢复完成');
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

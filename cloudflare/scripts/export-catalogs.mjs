import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { getKvValue, writeJson } from './catalog-tools.mjs';

const remote = process.argv.includes('--remote');
const local = process.argv.includes('--local');
if (remote === local) throw new Error('必须且只能指定 --local 或 --remote');

const mode = remote ? '--remote' : '--local';
const timestamp = new Date().toISOString().replaceAll(':', '-');
mkdirSync('backups', { recursive: true });
const outputPath = path.join('backups', `catalogs-${timestamp}.json`);
writeJson(outputPath, {
  home: JSON.parse(getKvValue('catalog:home', mode)),
  resume: JSON.parse(getKvValue('catalog:resume', mode)),
});
console.log(`备份已写入 ${outputPath}`);

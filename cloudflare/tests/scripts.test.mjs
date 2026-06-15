import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildEnvelope,
  buildKvArgs,
  ensureOverwriteAllowed,
  normalizeKvValue,
} from '../scripts/catalog-tools.mjs';

test('种子信封从 revision 1 开始', () => {
  const envelope = buildEnvelope({ schemaVersion: 1 }, '2026-06-15T10:00:00.000Z');
  assert.deepEqual(envelope, {
    revision: 1,
    updatedAt: '2026-06-15T10:00:00.000Z',
    catalog: { schemaVersion: 1 },
  });
});

test('已有数据时默认拒绝覆盖', () => {
  assert.throws(() => ensureOverwriteAllowed('existing', false), /已经存在/);
  assert.doesNotThrow(() => ensureOverwriteAllowed('existing', true));
  assert.doesNotThrow(() => ensureOverwriteAllowed('', false));
});

test('Wrangler 的不存在提示按空值处理', () => {
  assert.equal(normalizeKvValue('Value not found'), '');
  assert.equal(normalizeKvValue('{"revision":1}'), '{"revision":1}');
});

test('本地 KV 命令使用 preview 绑定并共享 Wrangler 状态目录', () => {
  assert.deepEqual(buildKvArgs(['kv', 'key', 'get', 'key'], '--local'), [
    'kv',
    'key',
    'get',
    'key',
    '--binding',
    'CATALOG_KV',
    '--preview',
    'true',
    '--local',
    '--persist-to',
    '.wrangler/state',
  ]);
});

test('远端 KV 命令使用生产绑定', () => {
  assert.deepEqual(buildKvArgs(['kv', 'key', 'get', 'key'], '--remote'), [
    'kv',
    'key',
    'get',
    'key',
    '--binding',
    'CATALOG_KV',
    '--preview',
    'false',
    '--remote',
  ]);
});

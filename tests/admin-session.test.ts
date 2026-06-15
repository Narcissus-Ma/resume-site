import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clearAdminSession,
  readAdminSession,
  saveAdminSession,
} from '../src/auth/admin-session.ts';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

test('管理员会话可保存、读取和清除', () => {
  const storage = new MemoryStorage();
  saveAdminSession(storage, { token: 'token', expiresAt: '2026-06-15T12:00:00.000Z' });
  assert.equal(readAdminSession(storage, Date.parse('2026-06-15T11:00:00Z'))?.token, 'token');
  clearAdminSession(storage);
  assert.equal(readAdminSession(storage), null);
});

test('过期或非法管理员会话自动清除', () => {
  const storage = new MemoryStorage();
  storage.setItem('resume-admin-session', '{');
  assert.equal(readAdminSession(storage), null);
  saveAdminSession(storage, { token: 'token', expiresAt: '2026-06-15T12:00:00.000Z' });
  assert.equal(readAdminSession(storage, Date.parse('2026-06-15T12:00:01Z')), null);
});

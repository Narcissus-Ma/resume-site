import assert from 'node:assert/strict';
import test from 'node:test';

import { getInitialTheme, shouldFollowSystemTheme } from '../src/theme/theme-preference.ts';

test('已保存主题时优先使用用户选择', () => {
  assert.equal(getInitialTheme('dark', false), 'dark');
  assert.equal(getInitialTheme('light', true), 'light');
});

test('没有保存主题时跟随系统偏好', () => {
  assert.equal(getInitialTheme(null, true), 'dark');
  assert.equal(getInitialTheme(null, false), 'light');
});

test('只有没有保存主题时才持续跟随系统', () => {
  assert.equal(shouldFollowSystemTheme(null), true);
  assert.equal(shouldFollowSystemTheme('dark'), false);
  assert.equal(shouldFollowSystemTheme('light'), false);
});

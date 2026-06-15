import assert from 'node:assert/strict';
import test from 'node:test';

import { getProjectCardHref } from '../src/components/project-card-link.ts';

test('返回去除首尾空格后的有效项目链接', () => {
  assert.equal(getProjectCardHref(' https://example.com/project '), 'https://example.com/project');
});

test('空链接和占位链接不生成可交互地址', () => {
  assert.equal(getProjectCardHref(''), null);
  assert.equal(getProjectCardHref('   '), null);
  assert.equal(getProjectCardHref('#'), null);
  assert.equal(getProjectCardHref(' # '), null);
});

test('危险协议不生成可交互地址', () => {
  assert.equal(getProjectCardHref('javascript:alert(1)'), null);
  assert.equal(getProjectCardHref('data:text/html,<h1>项目</h1>'), null);
});

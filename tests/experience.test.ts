import assert from 'node:assert/strict';
import test from 'node:test';

import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';

import Experience from '../src/components/experience.tsx';
import '../src/i18n/config.ts';

test('项目描述使用保留换行的纯文本样式', () => {
  const markup = renderToStaticMarkup(
    createElement(Experience, {
      experience: [],
      projects: [
        {
          name: '项目名称',
          period: '2024.01 - 2024.12',
          description: '第一行\n<strong>第二行</strong>',
        },
      ],
      education: [],
      website: [],
    }),
  );

  assert.match(
    markup,
    /<p class="[^"]*whitespace-pre-line[^"]*">第一行\n&lt;strong&gt;第二行&lt;\/strong&gt;<\/p>/,
  );
});

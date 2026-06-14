import assert from 'node:assert/strict';
import test from 'node:test';

import {
  appendHomeExperience,
  appendHomeProject,
  appendHomeSkill,
} from '../src/domain/home/rules/home-editor.ts';
import type { HomeData } from '../src/types/index.ts';

const data = (): HomeData => ({
  occupation: '旧职业',
  description: '旧简介',
  skills: [{ name: '旧技能', value: 50 }],
  experiences: [{ year: '旧', title: '旧', company: '旧', description: '旧' }],
  projects: [{ title: '旧', description: '旧', image: '旧', link: '旧' }],
});

test('添加主页条目时保留表单未保存内容', () => {
  const formData = data();
  formData.occupation = '尚未保存职业';
  formData.skills[0].name = '尚未保存技能';

  assert.equal(appendHomeSkill(data(), formData).occupation, '尚未保存职业');
  assert.equal(appendHomeSkill(data(), formData).skills[0].name, '尚未保存技能');
  assert.equal(appendHomeExperience(data(), formData).experiences.length, 2);
  assert.equal(appendHomeProject(data(), formData).projects.length, 2);
});

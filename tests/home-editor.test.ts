import assert from 'node:assert/strict';
import test from 'node:test';

import {
  appendHomeExperience,
  appendHomeProject,
  appendHomeSkill,
  appendHomeSkillHighlight,
  moveHomeSkillHighlight,
  removeHomeSkillHighlight,
} from '../src/domain/home/rules/home-editor.ts';
import type { HomeData } from '../src/types/index.ts';

const data = (): HomeData => ({
  occupation: '旧职业',
  description: '旧简介',
  skillSectionDescription: '旧技能简介',
  skillHighlights: [
    { id: 'one', icon: 'code', title: '卡片一', description: '描述一' },
    { id: 'two', icon: 'database', title: '卡片二', description: '描述二' },
  ],
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

test('新增技能描述卡片时保留表单未保存内容并使用指定 ID', () => {
  const formData = data();
  formData.skillSectionDescription = '尚未保存的技能简介';

  const result = appendHomeSkillHighlight(data(), formData, 'new-highlight');

  assert.equal(result.skillSectionDescription, '尚未保存的技能简介');
  assert.deepEqual(result.skillHighlights[2], {
    id: 'new-highlight',
    icon: 'code',
    title: '新技能方向',
    description: '请输入技能方向描述',
  });
});

test('技能描述卡片支持删除和上下移动', () => {
  const formData = data();

  assert.deepEqual(
    removeHomeSkillHighlight(data(), formData, 0).skillHighlights.map((item) => item.id),
    ['two'],
  );
  assert.deepEqual(
    moveHomeSkillHighlight(data(), formData, 1, -1).skillHighlights.map((item) => item.id),
    ['two', 'one'],
  );
  assert.deepEqual(
    moveHomeSkillHighlight(data(), formData, 0, -1).skillHighlights.map((item) => item.id),
    ['one', 'two'],
  );
});

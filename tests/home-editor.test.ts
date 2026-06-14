import assert from 'node:assert/strict';
import test from 'node:test';

import {
  appendHomeExperience,
  appendHomeProject,
  appendHomeSkill,
  appendHomeSkillHighlight,
  moveHomeExperience,
  moveHomeProject,
  moveHomeSkill,
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
  skills: [
    { name: '技能一', value: 50 },
    { name: '技能二', value: 60 },
  ],
  experiences: [
    { year: '第一段', title: '职位一', company: '公司一', description: '描述一' },
    { year: '第二段', title: '职位二', company: '公司二', description: '描述二' },
  ],
  projects: [
    { title: '项目一', description: '描述一', image: '图片一', link: '链接一' },
    { title: '项目二', description: '描述二', image: '图片二', link: '链接二' },
  ],
});

test('添加主页条目时保留表单未保存内容', () => {
  const formData = data();
  formData.occupation = '尚未保存职业';
  formData.skills[0].name = '尚未保存技能';

  assert.equal(appendHomeSkill(data(), formData).occupation, '尚未保存职业');
  assert.equal(appendHomeSkill(data(), formData).skills[0].name, '尚未保存技能');
  assert.equal(appendHomeExperience(data(), formData).experiences.length, 3);
  assert.equal(appendHomeProject(data(), formData).projects.length, 3);
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

test('技能、工作经历和项目支持上下移动并保留未保存内容', () => {
  const formData = data();
  formData.occupation = '尚未保存职业';
  formData.skills[1].name = '尚未保存技能二';
  formData.experiences[1].company = '尚未保存公司二';
  formData.projects[1].title = '尚未保存项目二';

  const movedSkills = moveHomeSkill(data(), formData, 1, -1);
  const movedExperiences = moveHomeExperience(data(), formData, 1, -1);
  const movedProjects = moveHomeProject(data(), formData, 1, -1);

  assert.equal(movedSkills.occupation, '尚未保存职业');
  assert.deepEqual(
    movedSkills.skills.map((item) => item.name),
    ['尚未保存技能二', '技能一'],
  );
  assert.deepEqual(
    movedExperiences.experiences.map((item) => item.company),
    ['尚未保存公司二', '公司一'],
  );
  assert.deepEqual(
    movedProjects.projects.map((item) => item.title),
    ['尚未保存项目二', '项目一'],
  );
});

test('技能、工作经历和项目越界移动时保持原顺序', () => {
  const formData = data();

  assert.deepEqual(moveHomeSkill(data(), formData, 0, -1).skills, formData.skills);
  assert.deepEqual(
    moveHomeExperience(data(), formData, formData.experiences.length - 1, 1).experiences,
    formData.experiences,
  );
  assert.deepEqual(
    moveHomeProject(data(), formData, formData.projects.length - 1, 1).projects,
    formData.projects,
  );
});

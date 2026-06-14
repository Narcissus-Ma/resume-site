import assert from 'node:assert/strict';
import test from 'node:test';

import {
  appendEducation,
  appendExperience,
  appendProject,
  appendSkillCategory,
  appendSkillDescription,
  appendSkillItem,
  appendWebsite,
} from '../src/domain/resume/rules/resume-editor.ts';
import type { ResumeData } from '../src/types/resume.ts';

const createResumeData = (skillDescriptions: string[]): ResumeData => ({
  basicInfo: {
    title: '前端开发工程师',
    skillDescriptions,
    skills: [
      {
        category: '旧技能类别',
        items: ['旧技能'],
      },
    ],
  },
  experience: [
    {
      company: '旧公司',
      position: '旧职位',
      period: '旧时间',
    },
  ],
  projects: [
    {
      name: '旧项目',
      period: '旧时间',
      description: '旧项目描述',
    },
  ],
  education: [
    {
      school: '旧学校',
      degree: '旧学历',
      period: '旧时间',
    },
  ],
  website: [
    {
      name: '旧网站',
      url: 'https://old.example.com',
    },
  ],
});

test('添加技能描述时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData(['旧的技能描述']);
  const formData = createResumeData(['尚未保存的技能描述']);

  const result = appendSkillDescription(storedData, formData);

  assert.deepEqual(result.basicInfo.skillDescriptions, ['尚未保存的技能描述', '新的技能描述']);
  assert.deepEqual(storedData.basicInfo.skillDescriptions, ['旧的技能描述']);
  assert.deepEqual(formData.basicInfo.skillDescriptions, ['尚未保存的技能描述']);
});

test('添加技能类别时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.basicInfo.title = '尚未保存的标题';
  formData.basicInfo.skills[0].category = '尚未保存的技能类别';

  const result = appendSkillCategory(storedData, formData);

  assert.equal(result.basicInfo.title, '尚未保存的标题');
  assert.deepEqual(result.basicInfo.skills, [
    { category: '尚未保存的技能类别', items: ['旧技能'] },
    { category: '新技能类别', items: ['新技能'] },
  ]);
});

test('添加技能时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.basicInfo.skills[0].items[0] = '尚未保存的技能';

  const result = appendSkillItem(storedData, formData, 0);

  assert.deepEqual(result.basicInfo.skills[0].items, ['尚未保存的技能', '新技能']);
});

test('添加工作经历时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.experience[0].company = '尚未保存的公司';

  const result = appendExperience(storedData, formData);

  assert.equal(result.experience[0].company, '尚未保存的公司');
  assert.equal(result.experience[1].company, '新公司');
});

test('添加项目经历时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.projects[0].description = '尚未保存的项目描述';

  const result = appendProject(storedData, formData);

  assert.equal(result.projects[0].description, '尚未保存的项目描述');
  assert.equal(result.projects[1].name, '新项目');
});

test('添加教育经历时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.education[0].school = '尚未保存的学校';

  const result = appendEducation(storedData, formData);

  assert.equal(result.education[0].school, '尚未保存的学校');
  assert.equal(result.education[1].school, '新学校');
});

test('添加网站链接时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.website[0].name = '尚未保存的网站';

  const result = appendWebsite(storedData, formData);

  assert.equal(result.website[0].name, '尚未保存的网站');
  assert.equal(result.website[1].name, '新网站');
});

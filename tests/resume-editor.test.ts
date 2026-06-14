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
  moveEducation,
  moveExperience,
  moveProject,
  moveSkillCategory,
  moveSkillDescription,
  moveWebsite,
} from '../src/domain/resume/rules/resume-editor.ts';
import type { ResumeData } from '../src/types/resume.ts';

const createResumeData = (skillDescriptions: string[]): ResumeData => ({
  basicInfo: {
    title: '前端开发工程师',
    skillDescriptions,
    skills: [
      {
        category: '技能类别一',
        items: ['技能一'],
      },
      {
        category: '技能类别二',
        items: ['技能二'],
      },
    ],
  },
  experience: [
    {
      company: '旧公司',
      position: '旧职位',
      period: '旧时间',
    },
    {
      company: '公司二',
      position: '职位二',
      period: '时间二',
    },
  ],
  projects: [
    {
      name: '旧项目',
      period: '旧时间',
      description: '旧项目描述',
    },
    {
      name: '项目二',
      period: '时间二',
      description: '项目描述二',
    },
  ],
  education: [
    {
      school: '旧学校',
      degree: '旧学历',
      period: '旧时间',
    },
    {
      school: '学校二',
      degree: '学历二',
      period: '时间二',
    },
  ],
  website: [
    {
      name: '旧网站',
      url: 'https://old.example.com',
    },
    {
      name: '网站二',
      url: 'https://second.example.com',
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
    { category: '尚未保存的技能类别', items: ['技能一'] },
    { category: '技能类别二', items: ['技能二'] },
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
  assert.equal(result.experience[2].company, '新公司');
});

test('添加项目经历时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.projects[0].description = '尚未保存的项目描述';

  const result = appendProject(storedData, formData);

  assert.equal(result.projects[0].description, '尚未保存的项目描述');
  assert.equal(result.projects[2].name, '新项目');
});

test('添加教育经历时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.education[0].school = '尚未保存的学校';

  const result = appendEducation(storedData, formData);

  assert.equal(result.education[0].school, '尚未保存的学校');
  assert.equal(result.education[2].school, '新学校');
});

test('添加网站链接时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData([]);
  const formData = createResumeData([]);
  formData.website[0].name = '尚未保存的网站';

  const result = appendWebsite(storedData, formData);

  assert.equal(result.website[0].name, '尚未保存的网站');
  assert.equal(result.website[2].name, '新网站');
});

test('六类简历列表支持上下移动并保留未保存内容', () => {
  const storedData = createResumeData(['描述一', '描述二']);
  const formData = createResumeData(['描述一', '尚未保存描述二']);
  formData.basicInfo.title = '尚未保存标题';
  formData.basicInfo.skills[1].category = '尚未保存技能类别二';
  formData.experience[1].company = '尚未保存公司二';
  formData.projects[1].name = '尚未保存项目二';
  formData.education[1].school = '尚未保存学校二';
  formData.website[1].name = '尚未保存网站二';

  const movedDescriptions = moveSkillDescription(storedData, formData, 1, -1);
  const movedCategories = moveSkillCategory(storedData, formData, 1, -1);
  const movedExperiences = moveExperience(storedData, formData, 1, -1);
  const movedProjects = moveProject(storedData, formData, 1, -1);
  const movedEducation = moveEducation(storedData, formData, 1, -1);
  const movedWebsites = moveWebsite(storedData, formData, 1, -1);

  assert.equal(movedDescriptions.basicInfo.title, '尚未保存标题');
  assert.deepEqual(movedDescriptions.basicInfo.skillDescriptions, ['尚未保存描述二', '描述一']);
  assert.deepEqual(
    movedCategories.basicInfo.skills.map((item) => item.category),
    ['尚未保存技能类别二', '技能类别一'],
  );
  assert.deepEqual(
    movedExperiences.experience.map((item) => item.company),
    ['尚未保存公司二', '旧公司'],
  );
  assert.deepEqual(
    movedProjects.projects.map((item) => item.name),
    ['尚未保存项目二', '旧项目'],
  );
  assert.deepEqual(
    movedEducation.education.map((item) => item.school),
    ['尚未保存学校二', '旧学校'],
  );
  assert.deepEqual(
    movedWebsites.website.map((item) => item.name),
    ['尚未保存网站二', '旧网站'],
  );
});

test('六类简历列表越界移动时保持原顺序', () => {
  const data = createResumeData(['描述一', '描述二']);

  assert.deepEqual(
    moveSkillDescription(data, data, 0, -1).basicInfo.skillDescriptions,
    data.basicInfo.skillDescriptions,
  );
  assert.deepEqual(
    moveSkillCategory(data, data, data.basicInfo.skills.length - 1, 1).basicInfo.skills,
    data.basicInfo.skills,
  );
  assert.deepEqual(moveExperience(data, data, 0, -1).experience, data.experience);
  assert.deepEqual(moveProject(data, data, data.projects.length - 1, 1).projects, data.projects);
  assert.deepEqual(moveEducation(data, data, 0, -1).education, data.education);
  assert.deepEqual(moveWebsite(data, data, data.website.length - 1, 1).website, data.website);
});

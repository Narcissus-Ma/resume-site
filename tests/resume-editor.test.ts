import assert from 'node:assert/strict';
import test from 'node:test';

import { appendSkillDescription } from '../src/domain/resume/rules/resume-editor.ts';
import type { ResumeData } from '../src/types/resume.ts';

const createResumeData = (skillDescriptions: string[]): ResumeData => ({
  basicInfo: {
    title: '前端开发工程师',
    skillDescriptions,
    skills: [],
  },
  experience: [],
  projects: [],
  education: [],
  website: [],
});

test('添加技能描述时保留表单中尚未保存的内容', () => {
  const storedData = createResumeData(['旧的技能描述']);
  const formData = createResumeData(['尚未保存的技能描述']);

  const result = appendSkillDescription(storedData, formData);

  assert.deepEqual(result.basicInfo.skillDescriptions, ['尚未保存的技能描述', '新的技能描述']);
  assert.deepEqual(storedData.basicInfo.skillDescriptions, ['旧的技能描述']);
  assert.deepEqual(formData.basicInfo.skillDescriptions, ['尚未保存的技能描述']);
});

import type { ResumeData } from '../../../types/resume';

const mergeResumeFormData = (storedData: ResumeData, formData: ResumeData): ResumeData => ({
  ...storedData,
  ...formData,
  basicInfo: {
    ...storedData.basicInfo,
    ...formData.basicInfo,
  },
});

export const appendSkillDescription = (
  storedData: ResumeData,
  formData: ResumeData,
): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);

  return {
    ...currentData,
    basicInfo: {
      ...currentData.basicInfo,
      skillDescriptions: [...currentData.basicInfo.skillDescriptions, '新的技能描述'],
    },
  };
};

export const appendSkillCategory = (storedData: ResumeData, formData: ResumeData): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);

  return {
    ...currentData,
    basicInfo: {
      ...currentData.basicInfo,
      skills: [...currentData.basicInfo.skills, { category: '新技能类别', items: ['新技能'] }],
    },
  };
};

export const appendSkillItem = (
  storedData: ResumeData,
  formData: ResumeData,
  categoryIndex: number,
): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);
  const skills = structuredClone(currentData.basicInfo.skills);
  skills[categoryIndex].items.push('新技能');

  return {
    ...currentData,
    basicInfo: {
      ...currentData.basicInfo,
      skills,
    },
  };
};

export const appendExperience = (storedData: ResumeData, formData: ResumeData): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);

  return {
    ...currentData,
    experience: [
      ...currentData.experience,
      {
        company: '新公司',
        position: '新职位',
        period: '2024.01 - 2024.12',
        achievements: ['新成就'],
      },
    ],
  };
};

export const appendProject = (storedData: ResumeData, formData: ResumeData): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);

  return {
    ...currentData,
    projects: [
      ...currentData.projects,
      {
        name: '新项目',
        period: '2024.01 - 2024.12',
        description: '项目描述',
        responsibilities: ['职责'],
      },
    ],
  };
};

export const appendEducation = (storedData: ResumeData, formData: ResumeData): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);

  return {
    ...currentData,
    education: [
      ...currentData.education,
      {
        school: '新学校',
        degree: '学历',
        period: '2024.01 - 2024.12',
        achievements: ['成就'],
      },
    ],
  };
};

export const appendWebsite = (storedData: ResumeData, formData: ResumeData): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);

  return {
    ...currentData,
    website: [
      ...currentData.website,
      {
        name: '新网站',
        url: 'https://example.com',
      },
    ],
  };
};

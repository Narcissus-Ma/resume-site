import type { ResumeData } from '../../../types/resume';

const mergeResumeFormData = (storedData: ResumeData, formData: ResumeData): ResumeData => ({
  ...storedData,
  ...formData,
  basicInfo: {
    ...storedData.basicInfo,
    ...formData.basicInfo,
  },
});

const moveItem = <T>(items: T[], index: number, offset: -1 | 1): T[] => {
  const targetIndex = index + offset;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
  return nextItems;
};

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

export const moveSkillDescription = (
  storedData: ResumeData,
  formData: ResumeData,
  index: number,
  offset: -1 | 1,
): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);

  return {
    ...currentData,
    basicInfo: {
      ...currentData.basicInfo,
      skillDescriptions: moveItem(currentData.basicInfo.skillDescriptions, index, offset),
    },
  };
};

export const moveSkillCategory = (
  storedData: ResumeData,
  formData: ResumeData,
  index: number,
  offset: -1 | 1,
): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);

  return {
    ...currentData,
    basicInfo: {
      ...currentData.basicInfo,
      skills: moveItem(currentData.basicInfo.skills, index, offset),
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

export const moveExperience = (
  storedData: ResumeData,
  formData: ResumeData,
  index: number,
  offset: -1 | 1,
): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);
  return { ...currentData, experience: moveItem(currentData.experience, index, offset) };
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

export const moveProject = (
  storedData: ResumeData,
  formData: ResumeData,
  index: number,
  offset: -1 | 1,
): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);
  return { ...currentData, projects: moveItem(currentData.projects, index, offset) };
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

export const moveEducation = (
  storedData: ResumeData,
  formData: ResumeData,
  index: number,
  offset: -1 | 1,
): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);
  return { ...currentData, education: moveItem(currentData.education, index, offset) };
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

export const moveWebsite = (
  storedData: ResumeData,
  formData: ResumeData,
  index: number,
  offset: -1 | 1,
): ResumeData => {
  const currentData = mergeResumeFormData(storedData, formData);
  return { ...currentData, website: moveItem(currentData.website, index, offset) };
};

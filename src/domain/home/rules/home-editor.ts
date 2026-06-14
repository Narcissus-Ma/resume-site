import type { HomeData } from '../../../types';

const merge = (storedData: HomeData, formData: HomeData): HomeData => ({
  ...storedData,
  ...formData,
});

export const appendHomeSkill = (storedData: HomeData, formData: HomeData): HomeData => {
  const current = merge(storedData, formData);
  return { ...current, skills: [...current.skills, { name: '新技能', value: 50 }] };
};

export const appendHomeExperience = (storedData: HomeData, formData: HomeData): HomeData => {
  const current = merge(storedData, formData);
  return {
    ...current,
    experiences: [
      ...current.experiences,
      { year: '2024 - 至今', title: '新职位', company: '新公司', description: '工作描述' },
    ],
  };
};

export const appendHomeProject = (storedData: HomeData, formData: HomeData): HomeData => {
  const current = merge(storedData, formData);
  return {
    ...current,
    projects: [
      ...current.projects,
      { title: '新项目', description: '项目描述', image: 'portfolio1.jpg', link: '#' },
    ],
  };
};

import type { HomeData } from '../../../types';

const merge = (storedData: HomeData, formData: HomeData): HomeData => ({
  ...storedData,
  ...formData,
});

export const appendHomeSkill = (storedData: HomeData, formData: HomeData): HomeData => {
  const current = merge(storedData, formData);
  return { ...current, skills: [...current.skills, { name: '新技能', value: 50 }] };
};

export const appendHomeSkillHighlight = (
  storedData: HomeData,
  formData: HomeData,
  id: string,
): HomeData => {
  const current = merge(storedData, formData);
  return {
    ...current,
    skillHighlights: [
      ...current.skillHighlights,
      {
        id,
        icon: 'code',
        title: '新技能方向',
        description: '请输入技能方向描述',
      },
    ],
  };
};

export const removeHomeSkillHighlight = (
  storedData: HomeData,
  formData: HomeData,
  index: number,
): HomeData => {
  const current = merge(storedData, formData);
  return {
    ...current,
    skillHighlights: current.skillHighlights.filter((_, itemIndex) => itemIndex !== index),
  };
};

export const moveHomeSkillHighlight = (
  storedData: HomeData,
  formData: HomeData,
  index: number,
  offset: -1 | 1,
): HomeData => {
  const current = merge(storedData, formData);
  const targetIndex = index + offset;

  if (targetIndex < 0 || targetIndex >= current.skillHighlights.length) {
    return current;
  }

  const skillHighlights = [...current.skillHighlights];
  [skillHighlights[index], skillHighlights[targetIndex]] = [
    skillHighlights[targetIndex],
    skillHighlights[index],
  ];

  return { ...current, skillHighlights };
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

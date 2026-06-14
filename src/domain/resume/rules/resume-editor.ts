import type { ResumeData } from '../../../types/resume';

export const appendSkillDescription = (
  storedData: ResumeData,
  formData: ResumeData,
): ResumeData => ({
  ...storedData,
  ...formData,
  basicInfo: {
    ...storedData.basicInfo,
    ...formData.basicInfo,
    skillDescriptions: [...formData.basicInfo.skillDescriptions, '新的技能描述'],
  },
});

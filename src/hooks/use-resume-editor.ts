import { useCallback } from 'react';

import { Form } from 'antd';

import { appendSkillDescription } from '@/domain/resume/rules/resume-editor';

import useResumeProfileManagement from './use-resume-profile-management';

const useResumeEditor = () => {
  const [form] = Form.useForm();
  const profileManagement = useResumeProfileManagement({ form });
  const { data, updateData } = profileManagement;

  // 添加技能类别
  const handleAddSkillCategory = useCallback(() => {
    if (!data) return;
    const newSkills = [...data.basicInfo.skills, { category: '新技能类别', items: ['新技能'] }];
    updateData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
  }, [data, updateData]);

  // 删除技能类别
  const handleDeleteSkillCategory = useCallback(
    (index: number) => {
      if (!data) return;
      const newSkills = data.basicInfo.skills.filter((_, i) => i !== index);
      updateData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
    },
    [data, updateData],
  );

  // 添加技能项
  const handleAddSkillItem = useCallback(
    (categoryIndex: number) => {
      if (!data) return;
      const newSkills = structuredClone(data.basicInfo.skills);
      newSkills[categoryIndex].items.push('新技能');
      updateData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
    },
    [data, updateData],
  );

  // 删除技能项
  const handleDeleteSkillItem = useCallback(
    (categoryIndex: number, itemIndex: number) => {
      if (!data) return;
      const newSkills = structuredClone(data.basicInfo.skills);
      newSkills[categoryIndex].items = newSkills[categoryIndex].items.filter(
        (_, i) => i !== itemIndex,
      );
      updateData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
    },
    [data, updateData],
  );

  // 添加技能描述
  const handleAddSkillDescription = useCallback(() => {
    if (!data) return;
    const formData = form.getFieldsValue(true);
    updateData(appendSkillDescription(data, formData));
  }, [data, form, updateData]);

  // 删除技能描述
  const handleDeleteSkillDescription = useCallback(
    (index: number) => {
      if (!data) return;
      const newDescriptions = data.basicInfo.skillDescriptions.filter((_, i) => i !== index);
      updateData({
        ...data,
        basicInfo: { ...data.basicInfo, skillDescriptions: newDescriptions },
      });
    },
    [data, updateData],
  );

  // 添加工作经历
  const handleAddExperience = useCallback(() => {
    if (!data) return;
    const newExperience = [
      ...data.experience,
      {
        company: '新公司',
        position: '新职位',
        period: '2024.01 - 2024.12',
        achievements: ['新成就'],
      },
    ];
    updateData({ ...data, experience: newExperience });
  }, [data, updateData]);

  // 删除工作经历
  const handleDeleteExperience = useCallback(
    (index: number) => {
      if (!data) return;
      const newExperience = data.experience.filter((_, i) => i !== index);
      updateData({ ...data, experience: newExperience });
    },
    [data, updateData],
  );

  // 添加项目经历
  const handleAddProject = useCallback(() => {
    if (!data) return;
    const newProjects = [
      ...data.projects,
      {
        name: '新项目',
        period: '2024.01 - 2024.12',
        description: '项目描述',
        responsibilities: ['职责'],
      },
    ];
    updateData({ ...data, projects: newProjects });
  }, [data, updateData]);

  // 删除项目经历
  const handleDeleteProject = useCallback(
    (index: number) => {
      if (!data) return;
      const newProjects = data.projects.filter((_, i) => i !== index);
      updateData({ ...data, projects: newProjects });
    },
    [data, updateData],
  );

  // 添加教育经历
  const handleAddEducation = useCallback(() => {
    if (!data) return;
    const newEducation = [
      ...data.education,
      {
        school: '新学校',
        degree: '学历',
        period: '2024.01 - 2024.12',
        achievements: ['成就'],
      },
    ];
    updateData({ ...data, education: newEducation });
  }, [data, updateData]);

  // 删除教育经历
  const handleDeleteEducation = useCallback(
    (index: number) => {
      if (!data) return;
      const newEducation = data.education.filter((_, i) => i !== index);
      updateData({ ...data, education: newEducation });
    },
    [data, updateData],
  );

  // 添加网站链接
  const handleAddWebsite = useCallback(() => {
    if (!data) return;
    const newWebsite = [
      ...data.website,
      {
        name: '新网站',
        url: 'https://example.com',
      },
    ];
    updateData({ ...data, website: newWebsite });
  }, [data, updateData]);

  // 删除网站链接
  const handleDeleteWebsite = useCallback(
    (index: number) => {
      if (!data) return;
      const newWebsite = data.website.filter((_, i) => i !== index);
      updateData({ ...data, website: newWebsite });
    },
    [data, updateData],
  );

  return {
    form,
    ...profileManagement,
    handleAddSkillCategory,
    handleDeleteSkillCategory,
    handleAddSkillItem,
    handleDeleteSkillItem,
    handleAddSkillDescription,
    handleDeleteSkillDescription,
    handleAddExperience,
    handleDeleteExperience,
    handleAddProject,
    handleDeleteProject,
    handleAddEducation,
    handleDeleteEducation,
    handleAddWebsite,
    handleDeleteWebsite,
  };
};

export default useResumeEditor;

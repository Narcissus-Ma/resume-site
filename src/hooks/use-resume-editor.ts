import { useCallback } from 'react';

import { Form } from 'antd';

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
} from '@/domain/resume/rules/resume-editor';

import useResumeProfileManagement from './use-resume-profile-management';

const useResumeEditor = () => {
  const [form] = Form.useForm();
  const profileManagement = useResumeProfileManagement({ form });
  const { data, updateData } = profileManagement;
  const current = useCallback(() => form.getFieldsValue(true), [form]);

  // 添加技能类别
  const handleAddSkillCategory = useCallback(() => {
    if (!data) return;
    const formData = form.getFieldsValue(true);
    updateData(appendSkillCategory(data, formData));
  }, [data, form, updateData]);

  // 删除技能类别
  const handleDeleteSkillCategory = useCallback(
    (index: number) => {
      if (!data) return;
      const newSkills = data.basicInfo.skills.filter((_, i) => i !== index);
      updateData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
    },
    [data, updateData],
  );

  const handleMoveSkillCategory = useCallback(
    (index: number, offset: -1 | 1) => {
      if (data) updateData(moveSkillCategory(data, current(), index, offset));
    },
    [current, data, updateData],
  );

  // 添加技能项
  const handleAddSkillItem = useCallback(
    (categoryIndex: number) => {
      if (!data) return;
      const formData = form.getFieldsValue(true);
      updateData(appendSkillItem(data, formData, categoryIndex));
    },
    [data, form, updateData],
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

  const handleMoveSkillDescription = useCallback(
    (index: number, offset: -1 | 1) => {
      if (data) updateData(moveSkillDescription(data, current(), index, offset));
    },
    [current, data, updateData],
  );

  // 添加工作经历
  const handleAddExperience = useCallback(() => {
    if (!data) return;
    const formData = form.getFieldsValue(true);
    updateData(appendExperience(data, formData));
  }, [data, form, updateData]);

  // 删除工作经历
  const handleDeleteExperience = useCallback(
    (index: number) => {
      if (!data) return;
      const newExperience = data.experience.filter((_, i) => i !== index);
      updateData({ ...data, experience: newExperience });
    },
    [data, updateData],
  );

  const handleMoveExperience = useCallback(
    (index: number, offset: -1 | 1) => {
      if (data) updateData(moveExperience(data, current(), index, offset));
    },
    [current, data, updateData],
  );

  // 添加项目经历
  const handleAddProject = useCallback(() => {
    if (!data) return;
    const formData = form.getFieldsValue(true);
    updateData(appendProject(data, formData));
  }, [data, form, updateData]);

  // 删除项目经历
  const handleDeleteProject = useCallback(
    (index: number) => {
      if (!data) return;
      const newProjects = data.projects.filter((_, i) => i !== index);
      updateData({ ...data, projects: newProjects });
    },
    [data, updateData],
  );

  const handleMoveProject = useCallback(
    (index: number, offset: -1 | 1) => {
      if (data) updateData(moveProject(data, current(), index, offset));
    },
    [current, data, updateData],
  );

  // 添加教育经历
  const handleAddEducation = useCallback(() => {
    if (!data) return;
    const formData = form.getFieldsValue(true);
    updateData(appendEducation(data, formData));
  }, [data, form, updateData]);

  // 删除教育经历
  const handleDeleteEducation = useCallback(
    (index: number) => {
      if (!data) return;
      const newEducation = data.education.filter((_, i) => i !== index);
      updateData({ ...data, education: newEducation });
    },
    [data, updateData],
  );

  const handleMoveEducation = useCallback(
    (index: number, offset: -1 | 1) => {
      if (data) updateData(moveEducation(data, current(), index, offset));
    },
    [current, data, updateData],
  );

  // 添加网站链接
  const handleAddWebsite = useCallback(() => {
    if (!data) return;
    const formData = form.getFieldsValue(true);
    updateData(appendWebsite(data, formData));
  }, [data, form, updateData]);

  // 删除网站链接
  const handleDeleteWebsite = useCallback(
    (index: number) => {
      if (!data) return;
      const newWebsite = data.website.filter((_, i) => i !== index);
      updateData({ ...data, website: newWebsite });
    },
    [data, updateData],
  );

  const handleMoveWebsite = useCallback(
    (index: number, offset: -1 | 1) => {
      if (data) updateData(moveWebsite(data, current(), index, offset));
    },
    [current, data, updateData],
  );

  return {
    form,
    ...profileManagement,
    handleAddSkillCategory,
    handleDeleteSkillCategory,
    handleMoveSkillCategory,
    handleAddSkillItem,
    handleDeleteSkillItem,
    handleAddSkillDescription,
    handleDeleteSkillDescription,
    handleMoveSkillDescription,
    handleAddExperience,
    handleDeleteExperience,
    handleMoveExperience,
    handleAddProject,
    handleDeleteProject,
    handleMoveProject,
    handleAddEducation,
    handleDeleteEducation,
    handleMoveEducation,
    handleAddWebsite,
    handleDeleteWebsite,
    handleMoveWebsite,
  };
};

export default useResumeEditor;

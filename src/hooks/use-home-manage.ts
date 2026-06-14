import { useCallback } from 'react';

import { Form } from 'antd';

import {
  appendHomeExperience,
  appendHomeProject,
  appendHomeSkill,
} from '@/domain/home/rules/home-editor';
import type { HomeData } from '@/types';

import useHomeProfileManagement from './use-home-profile-management';

const useHomeManage = () => {
  const [form] = Form.useForm<HomeData>();
  const management = useHomeProfileManagement({ form });
  const { data, updateData } = management;

  const current = useCallback(() => form.getFieldsValue(true) as HomeData, [form]);

  const handleAddSkill = useCallback(() => {
    if (data) updateData(appendHomeSkill(data, current()));
  }, [current, data, updateData]);

  const handleDeleteSkill = useCallback(
    (index: number) => {
      if (!data) return;
      const values = current();
      updateData({
        ...values,
        skills: values.skills.filter((_, itemIndex) => itemIndex !== index),
      });
    },
    [current, data, updateData],
  );

  const handleAddExperience = useCallback(() => {
    if (data) updateData(appendHomeExperience(data, current()));
  }, [current, data, updateData]);

  const handleDeleteExperience = useCallback(
    (index: number) => {
      if (!data) return;
      const values = current();
      updateData({
        ...values,
        experiences: values.experiences.filter((_, itemIndex) => itemIndex !== index),
      });
    },
    [current, data, updateData],
  );

  const handleAddProject = useCallback(() => {
    if (data) updateData(appendHomeProject(data, current()));
  }, [current, data, updateData]);

  const handleDeleteProject = useCallback(
    (index: number) => {
      if (!data) return;
      const values = current();
      updateData({
        ...values,
        projects: values.projects.filter((_, itemIndex) => itemIndex !== index),
      });
    },
    [current, data, updateData],
  );

  return {
    form,
    ...management,
    handleAddSkill,
    handleDeleteSkill,
    handleAddExperience,
    handleDeleteExperience,
    handleAddProject,
    handleDeleteProject,
  };
};

export default useHomeManage;

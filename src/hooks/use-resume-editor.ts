import { useState, useEffect, useCallback } from "react";

import { Form, message } from "antd";

import { useTranslation } from "react-i18next";

import { ResumeData } from "@/types/resume";
const useResumeEditor = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const { i18n } = useTranslation();

  // 从服务器获取最新的简历数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/resume?lang=${i18n.language}`);
        if (response.ok) {
          const resumeData = await response.json();
          setData(resumeData);
          form.setFieldsValue(resumeData);
        }
      } catch (error) {
        console.error("获取简历数据失败:", error);
      }
    };

    fetchData();
  }, [form, i18n.language]);

  // 保存数据
  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 发送请求保存数据
      const response = await fetch(`http://localhost:3001/api/resume?lang=${i18n.language}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("保存成功");
      } else {
        message.error("保存失败");
      }
    } catch {
      message.error("保存失败");
    } finally {
      setLoading(false);
    }
  }, [form, i18n.language]);

  // 添加技能类别
  const handleAddSkillCategory = useCallback(() => {
    if (!data) return;
    const newSkills = [
      ...data.basicInfo.skills,
      { category: "新技能类别", items: ["新技能"] },
    ];
    setData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
  }, [data]);

  // 删除技能类别
  const handleDeleteSkillCategory = useCallback((index: number) => {
    if (!data) return;
    const newSkills = data.basicInfo.skills.filter((_, i) => i !== index);
    setData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
  }, [data]);

  // 添加技能项
  const handleAddSkillItem = useCallback((categoryIndex: number) => {
    if (!data) return;
    const newSkills = [...data.basicInfo.skills];
    newSkills[categoryIndex].items.push("新技能");
    setData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
  }, [data]);

  // 删除技能项
  const handleDeleteSkillItem = useCallback(
    (categoryIndex: number, itemIndex: number) => {
      if (!data) return;
    const newSkills = [...data.basicInfo.skills];
    newSkills[categoryIndex].items = newSkills[categoryIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setData({ ...data, basicInfo: { ...data.basicInfo, skills: newSkills } });
  }, [data]);

  // 添加技能描述
  const handleAddSkillDescription = useCallback(() => {
    if (!data) return;
    const newDescriptions = [
      ...data.basicInfo.skillDescriptions,
      "新的技能描述",
    ];
    setData({
      ...data,
      basicInfo: { ...data.basicInfo, skillDescriptions: newDescriptions },
    });
  }, [data]);

  // 删除技能描述
  const handleDeleteSkillDescription = useCallback((index: number) => {
    if (!data) return;
    const newDescriptions = data.basicInfo.skillDescriptions.filter(
      (_, i) => i !== index
    );
    setData({
      ...data,
      basicInfo: { ...data.basicInfo, skillDescriptions: newDescriptions },
    });
  }, [data]);

  // 添加工作经历
  const handleAddExperience = useCallback(() => {
    if (!data) return;
    const newExperience = [
      ...data.experience,
      {
        company: "新公司",
        position: "新职位",
        period: "2024.01 - 2024.12",
        achievements: ["新成就"],
      },
    ];
    setData({ ...data, experience: newExperience });
  }, [data]);

  // 删除工作经历
  const handleDeleteExperience = useCallback((index: number) => {
    if (!data) return;
    const newExperience = data.experience.filter((_, i) => i !== index);
    setData({ ...data, experience: newExperience });
  }, [data]);

  // 添加项目经历
  const handleAddProject = useCallback(() => {
    if (!data) return;
    const newProjects = [
      ...data.projects,
      {
        name: "新项目",
        period: "2024.01 - 2024.12",
        description: "项目描述",
        responsibilities: ["职责"],
      },
    ];
    setData({ ...data, projects: newProjects });
  }, [data]);

  // 删除项目经历
  const handleDeleteProject = useCallback((index: number) => {
    if (!data) return;
    const newProjects = data.projects.filter((_, i) => i !== index);
    setData({ ...data, projects: newProjects });
  }, [data]);

  // 添加教育经历
  const handleAddEducation = useCallback(() => {
    if (!data) return;
    const newEducation = [
      ...data.education,
      {
        school: "新学校",
        degree: "学历",
        period: "2024.01 - 2024.12",
        achievements: ["成就"],
      },
    ];
    setData({ ...data, education: newEducation });
  }, [data]);

  // 删除教育经历
  const handleDeleteEducation = useCallback((index: number) => {
    if (!data) return;
    const newEducation = data.education.filter((_, i) => i !== index);
    setData({ ...data, education: newEducation });
  }, [data]);

  // 添加网站链接
  const handleAddWebsite = useCallback(() => {
    if (!data) return;
    const newWebsite = [
      ...data.website,
      {
        name: "新网站",
        url: "https://example.com",
      },
    ];
    setData({ ...data, website: newWebsite });
  }, [data]);

  // 删除网站链接
  const handleDeleteWebsite = useCallback((index: number) => {
    if (!data) return;
    const newWebsite = data.website.filter((_, i) => i !== index);
    setData({ ...data, website: newWebsite });
  }, [data]);

  return {
    form,
    data,
    loading,
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
    handleSave,
  };
};

export default useResumeEditor;

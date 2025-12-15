import { useState, useEffect, useCallback } from "react";

import {
  Form,
  message,
} from "antd";


import { HomeData, Skill, Experience, Project } from "@/types";

const useHomeManage = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(false);

  // 从服务器获取最新的主页数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/home");
        if (response.ok) {
          const homeData = await response.json();
          setData(homeData);
          form.setFieldsValue(homeData);
        }
      } catch (error) {
        console.error("获取主页数据失败:", error);
      }
    };

    fetchData();
  }, [form]);

  // 保存数据
  const handleSave = useCallback(() => async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 发送请求保存数据
      const response = await fetch("http://localhost:3001/api/home", {
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
  },[form]);

  // 添加技能
  const handleAddSkill = useCallback(() => {
    if (!data) return;
    const newSkill: Skill = { name: "新技能", value: 50 };
    const newSkills = [...data.skills, newSkill];
    setData({ ...data, skills: newSkills });
  },[data]);

  // 删除技能
  const handleDeleteSkill = useCallback((index: number) => {
    if (!data) return;
    const newSkills = data.skills.filter((_, i) => i !== index);
    setData({ ...data, skills: newSkills });
  },[data]);

  // 添加工作经历
  const handleAddExperience = useCallback(() => {
    if (!data) return;
    const newExperience: Experience = {
      year: "2024 - 至今",
      title: "新职位",
      company: "新公司",
      description: "工作描述",
    };
    const newExperiences = [...data.experiences, newExperience];
    setData({ ...data, experiences: newExperiences });
  },[data]);

  // 删除工作经历
  const handleDeleteExperience = useCallback((index: number) => {
    if (!data) return;
    const newExperiences = data.experiences.filter((_, i) => i !== index);
    setData({ ...data, experiences: newExperiences });
  },[data]);

  // 添加项目
  const handleAddProject = useCallback(() => {
    if (!data) return;
    const newProject: Project = {
      title: "新项目",
      description: "项目描述",
      image: "portfolio1.jpg",
      link: "#",
    };
    const newProjects = [...data.projects, newProject];
    setData({ ...data, projects: newProjects });
  },[data]);

  // 删除项目
  const handleDeleteProject = useCallback((index: number) => {
    if (!data) return;
    const newProjects = data.projects.filter((_, i) => i !== index);
    setData({ ...data, projects: newProjects });
  },[data]);

  return {
    form,
    data,
    loading,
    handleSave,
    handleAddSkill,
    handleDeleteSkill,
    handleAddExperience,
    handleDeleteExperience,
    handleAddProject,
    handleDeleteProject,
  }
}
export default useHomeManage;
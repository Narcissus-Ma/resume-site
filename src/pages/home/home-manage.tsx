import { useState, useEffect } from "react";

import {
  Button,
  Form,
  Input,
  Card,
  Space,
  Typography,
  message,
  InputNumber,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import { HomeData, Skill, Experience, Project } from "@/types";

const { TextArea } = Input;
const { Title, Text } = Typography;

const HomeManage = () => {
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
  const handleSave = async () => {
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
  };

  // 添加技能
  const handleAddSkill = () => {
    if (!data) return;
    const newSkill: Skill = { name: "新技能", value: 50 };
    const newSkills = [...data.skills, newSkill];
    setData({ ...data, skills: newSkills });
  };

  // 删除技能
  const handleDeleteSkill = (index: number) => {
    if (!data) return;
    const newSkills = data.skills.filter((_, i) => i !== index);
    setData({ ...data, skills: newSkills });
  };

  // 添加工作经历
  const handleAddExperience = () => {
    if (!data) return;
    const newExperience: Experience = {
      year: "2024 - 至今",
      title: "新职位",
      company: "新公司",
      description: "工作描述",
    };
    const newExperiences = [...data.experiences, newExperience];
    setData({ ...data, experiences: newExperiences });
  };

  // 删除工作经历
  const handleDeleteExperience = (index: number) => {
    if (!data) return;
    const newExperiences = data.experiences.filter((_, i) => i !== index);
    setData({ ...data, experiences: newExperiences });
  };

  // 添加项目
  const handleAddProject = () => {
    if (!data) return;
    const newProject: Project = {
      title: "新项目",
      description: "项目描述",
      image: "portfolio1.jpg",
      link: "#",
    };
    const newProjects = [...data.projects, newProject];
    setData({ ...data, projects: newProjects });
  };

  // 删除项目
  const handleDeleteProject = (index: number) => {
    if (!data) return;
    const newProjects = data.projects.filter((_, i) => i !== index);
    setData({ ...data, projects: newProjects });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="mb-6">
          主页数据管理器
        </Title>

        <Card className="mb-4">
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存
            </Button>
            <Link to="/">
              <Button type="default" icon={<EyeOutlined />}>
                预览
              </Button>
            </Link>
          </Space>
        </Card>

        {data && (
          <Form form={form} layout="vertical" initialValues={data}>
            {/* 技能 */}
            <Card title="技能" className="mb-4">
              {data.skills.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>技能 {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteSkill(index)}
                    />
                  </Space>

                  <Space.Compact block className="mb-2">
                    <Form.Item
                      name={["skills", index, "name"]}
                      label="技能名称"
                      noStyle
                      rules={[{ required: true, message: "请输入技能名称" }]}
                    >
                      <Input placeholder="技能名称" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item
                      name={["skills", index, "value"]}
                      label="熟练度"
                      noStyle
                      rules={[{ required: true, message: "请输入熟练度" }]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        placeholder="0-100"
                        style={{ width: 100 }}
                      />
                    </Form.Item>
                  </Space.Compact>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddSkill}
                block
              >
                添加技能
              </Button>
            </Card>

            {/* 工作经历 */}
            <Card title="工作经历" className="mb-4">
              {data.experiences.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>工作经历 {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteExperience(index)}
                    />
                  </Space>

                  <Form.Item
                    name={["experiences", index, "year"]}
                    label="时间段"
                    noStyle
                    rules={[{ required: true, message: "请输入时间段" }]}
                  >
                    <Input placeholder="2022 - 至今" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                    name={["experiences", index, "company"]}
                    label="公司"
                    noStyle
                    rules={[{ required: true, message: "请输入公司名称" }]}
                  >
                    <Input placeholder="公司名称" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                    name={["experiences", index, "title"]}
                    label="职位"
                    noStyle
                    rules={[{ required: true, message: "请输入职位" }]}
                  >
                    <Input placeholder="职位" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                    name={["experiences", index, "description"]}
                    label="描述"
                    noStyle
                    rules={[{ required: true, message: "请输入工作描述" }]}
                  >
                    <TextArea rows={3} placeholder="工作描述" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddExperience}
                block
              >
                添加工作经历
              </Button>
            </Card>

            {/* 项目 */}
            <Card title="项目" className="mb-4">
              {data.projects.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>项目 {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteProject(index)}
                    />
                  </Space>

                  <Form.Item
                    name={["projects", index, "title"]}
                    label="项目名称"
                    noStyle
                    rules={[{ required: true, message: "请输入项目名称" }]}
                  >
                    <Input placeholder="项目名称" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                    name={["projects", index, "description"]}
                    label="项目描述"
                    noStyle
                    rules={[{ required: true, message: "请输入项目描述" }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="项目描述"
                      className="mb-2"
                    />
                  </Form.Item>

                  <Form.Item
                    name={["projects", index, "image"]}
                    label="图片路径"
                    noStyle
                    rules={[{ required: true, message: "请输入图片路径" }]}
                  >
                    <Input placeholder="portfolio1.jpg" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                    name={["projects", index, "link"]}
                    label="项目链接"
                    noStyle
                    rules={[{ required: true, message: "请输入项目链接" }]}
                  >
                    <Input placeholder="#" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddProject}
                block
              >
                添加项目
              </Button>
            </Card>
          </Form>
        )}
      </div>
    </div>
  );
};

export default HomeManage;

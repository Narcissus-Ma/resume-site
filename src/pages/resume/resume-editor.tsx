
import { Button, Form, Input, Card, Space, Typography } from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import useResumeEditor from "@/hooks/use-resume-editor";

const { TextArea } = Input;
const { Title, Text } = Typography;

const ResumeEditor = () => {
  const {
    form,
    data,
    loading,
    handleAddSkillCategory,
    handleDeleteSkillCategory,
    handleAddSkillItem,
    handleDeleteSkillItem,
    handleAddSkillDescription,
    handleDeleteSkillDescription,
    handleAddWebsite,
    handleDeleteWebsite,
    handleAddEducation,
    handleDeleteEducation,
    handleAddProject,
    handleDeleteProject,
    handleAddExperience,
    handleDeleteExperience,
    handleSave,
  } = useResumeEditor();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="mb-6">
          简历编辑器
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
            <Link to="/resume">
              <Button type="default" icon={<EyeOutlined />}>
                预览
              </Button>
            </Link>
          </Space>
        </Card>

        {data && (
          <Form form={form} layout="vertical" initialValues={data}>
            {/* 基本信息 */}
            <Card title="基本信息" className="mb-4">
              <Form.Item name={["basicInfo", "title"]} label="标题">
                <Input />
              </Form.Item>
            </Card>

            {/* 技能描述 */}
            <Card title="技能描述" className="mb-4">
              {data.basicInfo.skillDescriptions.map((_, index) => (
                <Space key={index} className="mb-2" align="baseline">
                  <Form.Item
                    name={["basicInfo", "skillDescriptions", index]}
                    noStyle
                  >
                    <TextArea rows={2} placeholder="技能描述" />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteSkillDescription(index)}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddSkillDescription}
                block
              >
                添加技能描述
              </Button>
            </Card>

            {/* 技能 */}
            <Card title="技能" className="mb-4">
              {data.basicInfo.skills.map((skill, categoryIndex) => (
                <div key={categoryIndex} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Form.Item
                      name={["basicInfo", "skills", categoryIndex, "category"]}
                      label="技能类别"
                      noStyle
                    >
                      <Input placeholder="技能类别" />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteSkillCategory(categoryIndex)}
                    />
                  </Space>

                  {skill.items.map((_, itemIndex) => (
                    <Space key={itemIndex} className="mb-2" align="baseline">
                      <Form.Item
                        name={[
                          "basicInfo",
                          "skills",
                          categoryIndex,
                          "items",
                          itemIndex,
                        ]}
                        noStyle
                      >
                        <Input placeholder="技能项" style={{ width: 200 }} />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          handleDeleteSkillItem(categoryIndex, itemIndex)
                        }
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddSkillItem(categoryIndex)}
                      />
                    </Space>
                  ))}
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddSkillCategory}
                block
              >
                添加技能类别
              </Button>
            </Card>

            {/* 工作经历 */}
            <Card title="工作经历" className="mb-4">
              {data.experience.map((_, index) => (
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
                    name={["experience", index, "company"]}
                    label="公司"
                    noStyle
                  >
                    <Input placeholder="公司名称" />
                  </Form.Item>

                  <Form.Item
                    name={["experience", index, "position"]}
                    label="职位"
                    noStyle
                  >
                    <Input placeholder="职位" />
                  </Form.Item>

                  <Form.Item
                    name={["experience", index, "period"]}
                    label="时间段"
                    noStyle
                  >
                    <Input placeholder="2024.01 - 2024.12" />
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

            {/* 项目经历 */}
            <Card title="项目经历" className="mb-4">
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
                    name={["projects", index, "name"]}
                    label="项目名称"
                    noStyle
                  >
                    <Input placeholder="项目名称" />
                  </Form.Item>

                  <Form.Item
                    name={["projects", index, "period"]}
                    label="时间段"
                    noStyle
                  >
                    <Input placeholder="2024.01 - 2024.12" />
                  </Form.Item>

                  <Form.Item
                    name={["projects", index, "description"]}
                    label="项目描述"
                    noStyle
                  >
                    <TextArea rows={3} placeholder="项目描述" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddProject}
                block
              >
                添加项目经历
              </Button>
            </Card>

            {/* 教育经历 */}
            <Card title="教育经历" className="mb-4">
              {data.education.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>教育经历 {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteEducation(index)}
                    />
                  </Space>

                  <Form.Item
                    name={["education", index, "school"]}
                    label="学校"
                    noStyle
                  >
                    <Input placeholder="学校名称" />
                  </Form.Item>

                  <Form.Item
                    name={["education", index, "degree"]}
                    label="学历"
                    noStyle
                  >
                    <Input placeholder="学历" />
                  </Form.Item>

                  <Form.Item
                    name={["education", index, "period"]}
                    label="时间段"
                    noStyle
                  >
                    <Input placeholder="2024.01 - 2024.12" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddEducation}
                block
              >
                添加教育经历
              </Button>
            </Card>

            {/* 网站链接 */}
            <Card title="网站链接" className="mb-4">
              {data.website.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>网站 {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteWebsite(index)}
                    />
                  </Space>

                  <Form.Item
                    name={["website", index, "name"]}
                    label="网站名称"
                    noStyle
                  >
                    <Input placeholder="网站名称" />
                  </Form.Item>

                  <Form.Item
                    name={["website", index, "url"]}
                    label="网站URL"
                    noStyle
                  >
                    <Input placeholder="https://example.com" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddWebsite}
                block
              >
                添加网站链接
              </Button>
            </Card>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ResumeEditor;

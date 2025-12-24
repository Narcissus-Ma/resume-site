
import { Button, Form, Input, Card, Space, Typography } from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="mb-6">
          {t("resumeEditor.title")}
        </Title>

        <Card className="mb-4">
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              {t("resumeEditor.save")}
            </Button>
            <Link to="/resume">
              <Button type="default" icon={<EyeOutlined />}>
                {t("resumeEditor.preview")}
              </Button>
            </Link>
          </Space>
        </Card>

        {data && (
          <Form form={form} layout="vertical" initialValues={data}>
            {/* 基本信息 */}
            <Card title={t("resumeEditor.basicInfo")} className="mb-4">
              <Form.Item name={["basicInfo", "title"]} label={t("resumeEditor.titleLabel")}>
                <Input />
              </Form.Item>
            </Card>

            {/* 技能描述 */}
            <Card title={t("skills.descriptionTitle")} className="mb-4">
              {data.basicInfo.skillDescriptions.map((_, index) => (
                <Space key={index} className="mb-2" align="baseline">
                  <Form.Item
                    name={["basicInfo", "skillDescriptions", index]}
                    noStyle
                  >
                    <TextArea rows={2} placeholder={t("resumeEditor.skillDescriptionPlaceholder")} />
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
                {t("resumeEditor.addSkillDescription")}
              </Button>
            </Card>

            {/* 技能 */}
            <Card title={t("resumeEditor.skills")} className="mb-4">
              {data.basicInfo.skills.map((skill, categoryIndex) => (
                <div key={categoryIndex} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Form.Item
                      name={["basicInfo", "skills", categoryIndex, "category"]}
                      label={t("resumeEditor.skillCategory")}
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
                        <Input placeholder={t("resumeEditor.skillItem")} style={{ width: 200 }} />
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
                {t("resumeEditor.addSkillCategory")}
              </Button>
            </Card>

            {/* 工作经历 */}
            <Card title={t("resumeEditor.workExperience")} className="mb-4">
              {data.experience.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>{t("resumeEditor.workExperience")} {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteExperience(index)}
                    />
                  </Space>

                  <Form.Item
                      name={["experience", index, "company"]}
                      label={t("resumeEditor.company")}
                      noStyle
                    >
                    <Input className="mb-2" placeholder="公司名称" />
                  </Form.Item>

                  <Form.Item
                      name={["experience", index, "position"]}
                      label={t("resumeEditor.position")}
                      noStyle
                    >
                    <Input className="mb-2" placeholder="职位" />
                  </Form.Item>

                  <Form.Item
                      name={["experience", index, "period"]}
                      label={t("resumeEditor.period")}
                      noStyle
                    >
                    <Input className="mb-2" placeholder="2024.01 - 2024.12" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddExperience}
                block
              >
                {t("resumeEditor.addWorkExperience")}
              </Button>
            </Card>

            {/* 项目经历 */}
            <Card title={t("resumeEditor.projectExperience")} className="mb-4">
              {data.projects.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>{t("resumeEditor.projects")} {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteProject(index)}
                    />
                  </Space>

                  <Form.Item
                      name={["projects", index, "name"]}
                      label={t("resumeEditor.projectName")}
                      noStyle
                    >
                    <Input className="mb-2" placeholder="项目名称" />
                  </Form.Item>

                  <Form.Item
                    name={["projects", index, "period"]}
                    label={t("resumeEditor.timePeriod")}
                    noStyle
                  >
                    <Input className="mb-2" placeholder="2024.01 - 2024.12" />
                  </Form.Item>

                  <Form.Item
                      name={["projects", index, "description"]}
                      label={t("resumeEditor.projectDescription")}
                      noStyle
                    >
                    <TextArea className="mb-2" rows={3} placeholder="项目描述" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddProject}
                block
              >
                {t("resumeEditor.addProjectExperience")}
              </Button>
            </Card>

            {/* 教育经历 */}
            <Card title={t("resumeEditor.education")} className="mb-4">
              {data.education.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>{t("resumeEditor.education")} {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteEducation(index)}
                    />
                  </Space>

                  <Form.Item
                      name={["education", index, "school"]}
                      label={t("resumeEditor.school")}
                      noStyle
                    >
                    <Input className="mb-2" placeholder="学校名称" />
                  </Form.Item>

                  <Form.Item
                      name={["education", index, "degree"]}
                      label={t("resumeEditor.degree")}
                      noStyle
                    >
                    <Input className="mb-2" placeholder="学历" />
                  </Form.Item>

                  <Form.Item
                    name={["education", index, "period"]}
                    label={t("resumeEditor.timePeriod")}
                    noStyle
                  >
                    <Input className="mb-2" placeholder="2024.01 - 2024.12" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddEducation}
                block
              >
                {t("resumeEditor.addEducation")}
              </Button>
            </Card>

            {/* 网站链接 */}
            <Card title={t("resumeEditor.websites")} className="mb-4">
              {data.website.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>{t("resumeEditor.websites")} {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteWebsite(index)}
                    />
                  </Space>

                  <Form.Item
                      name={["website", index, "name"]}
                      label={t("resumeEditor.websiteName")}
                      noStyle
                    >
                    <Input className="mb-2" placeholder="网站名称" />
                  </Form.Item>

                  <Form.Item
                      name={["website", index, "url"]}
                      label={t("resumeEditor.websiteUrl")}
                      noStyle
                    >
                    <Input className="mb-2" placeholder="https://example.com" />
                  </Form.Item>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddWebsite}
                block
              >
                {t("resumeEditor.addWebsite")}
              </Button>
            </Card>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ResumeEditor;

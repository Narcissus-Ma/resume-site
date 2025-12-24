import {
  Button,
  Form,
  Input,
  Card,
  Space,
  Typography,
  InputNumber,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import useHomeManage from "@/hooks/use-home-manage";

const { TextArea } = Input;
const { Title, Text } = Typography;

const HomeManage = () => {
  const {
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
  } = useHomeManage();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Title level={2} className="mb-6">
            {t("homeManage.title")}
          </Title>

        <Card className="mb-4">
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              {t("homeManage.save")}
            </Button>
            <Link to="/">
              <Button type="default" icon={<EyeOutlined />}>
                {t("homeManage.preview")}
              </Button>
            </Link>
          </Space>
        </Card>

        {data && (
          <Form form={form} layout="vertical" initialValues={data}>
            {/* 技能 */}
            <Card title={t("homeManage.skills")} className="mb-4">
              {data.skills.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>{t("homeManage.skill")} {index + 1}</Text>
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
                      label={t("homeManage.skillName")}
                      noStyle
                      rules={[{ required: true, message: "请输入技能名称" }]}
                    >
                      <Input placeholder="技能名称" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item
                      name={["skills", index, "value"]}
                      label={t("homeManage.proficiency")}
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
                {t("homeManage.addSkill")}
              </Button>
            </Card>

            {/* 工作经历 */}
            <Card title={t("homeManage.experience")} className="mb-4">
              {data.experiences.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>{t("homeManage.experience")} {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteExperience(index)}
                    />
                  </Space>

                  <Form.Item
                      name={["experiences", index, "year"]}
                      label={t("homeManage.year")}
                      noStyle
                      rules={[{ required: true, message: "请输入时间段" }]}
                    >
                    <Input placeholder="2022 - 至今" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                      name={["experiences", index, "company"]}
                      label={t("homeManage.company")}
                      noStyle
                      rules={[{ required: true, message: "请输入公司名称" }]}
                    >
                    <Input placeholder="公司名称" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                      name={["experiences", index, "title"]}
                      label={t("homeManage.position")}
                      noStyle
                      rules={[{ required: true, message: "请输入职位" }]}
                    >
                    <Input placeholder="职位" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                      name={["experiences", index, "description"]}
                      label={t("homeManage.description")}
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
                {t("homeManage.addExperience")}
              </Button>
            </Card>

            {/* 项目 */}
            <Card title={t("homeManage.projects")} className="mb-4">
              {data.projects.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space className="mb-2" align="baseline">
                    <Text strong>{t("homeManage.projects")} {index + 1}</Text>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteProject(index)}
                    />
                  </Space>

                  <Form.Item
                      name={["projects", index, "title"]}
                      label={t("homeManage.projectName")}
                      noStyle
                      rules={[{ required: true, message: "请输入项目名称" }]}
                    >
                    <Input placeholder="项目名称" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                      name={["projects", index, "description"]}
                      label={t("homeManage.projectDescription")}
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
                      label={t("homeManage.imagePath")}
                      noStyle
                      rules={[{ required: true, message: "请输入图片路径" }]}
                    >
                    <Input placeholder="portfolio1.jpg" className="mb-2" />
                  </Form.Item>

                  <Form.Item
                      name={["projects", index, "link"]}
                      label={t("homeManage.projectLink")}
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
                {t("homeManage.addProject")}
              </Button>
            </Card>
          </Form>
        )}
      </div>
    </div>
  );
};

export default HomeManage;

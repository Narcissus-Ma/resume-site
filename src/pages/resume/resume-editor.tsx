import { Button, Form, Input, Card, Space, Typography, Modal, Result, Spin } from 'antd';

import { PlusOutlined, DeleteOutlined, SaveOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ResumeProfileToolbar from '@/components/resume-profile-toolbar';
import useResumeEditor from '@/hooks/use-resume-editor';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ResumeEditor = () => {
  const {
    form,
    catalog,
    data,
    loading,
    error,
    isDirty,
    selectedResumeId,
    selectedLanguage,
    unsavedDialogOpen,
    markDirty,
    selectResume,
    selectLanguage,
    createResume,
    copyResume,
    renameResume,
    deleteResume,
    setActiveResume,
    retry,
    confirmSaveAndContinue,
    confirmDiscardAndContinue,
    cancelPendingAction,
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
        <Title className="mb-6" level={2}>
          {t('resumeEditor.title')}
        </Title>

        {catalog && (
          <Card className="mb-4">
            <ResumeProfileToolbar
              catalog={catalog}
              isDirty={isDirty}
              loading={loading}
              selectedLanguage={selectedLanguage}
              selectedResumeId={selectedResumeId}
              onCopyResume={copyResume}
              onCreateResume={createResume}
              onDeleteResume={deleteResume}
              onRenameResume={renameResume}
              onSelectLanguage={selectLanguage}
              onSelectResume={selectResume}
              onSetActiveResume={setActiveResume}
            />
          </Card>
        )}

        <Card className="mb-4">
          <Space>
            <Button icon={<SaveOutlined />} loading={loading} type="primary" onClick={handleSave}>
              {t('resumeEditor.save')}
            </Button>
            <Link to="/resume">
              <Button icon={<EyeOutlined />} type="default">
                {t('resumeEditor.preview')}
              </Button>
            </Link>
          </Space>
        </Card>

        {loading && !data && (
          <div className="flex min-h-60 items-center justify-center">
            <Spin size="large" />
          </div>
        )}

        {error && !data && (
          <Result
            status="error"
            subTitle={error}
            title={t('resumeEditor.profile.loadFailed')}
            extra={
              <Button type="primary" onClick={retry}>
                {t('resumeEditor.profile.retry')}
              </Button>
            }
          />
        )}

        {data && (
          <Form form={form} initialValues={data} layout="vertical" onValuesChange={markDirty}>
            {/* 基本信息 */}
            <Card className="mb-4" title={t('resumeEditor.basicInfo')}>
              <Form.Item label={t('resumeEditor.titleLabel')} name={['basicInfo', 'title']}>
                <Input />
              </Form.Item>
            </Card>

            {/* 技能描述 */}
            <Card className="mb-4" title={t('skills.descriptionTitle')}>
              {data.basicInfo.skillDescriptions.map((_, index) => (
                <Space key={index} align="baseline" className="mb-2">
                  <Form.Item noStyle name={['basicInfo', 'skillDescriptions', index]}>
                    <TextArea
                      placeholder={t('resumeEditor.skillDescriptionPlaceholder')}
                      rows={2}
                    />
                  </Form.Item>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    type="text"
                    onClick={() => handleDeleteSkillDescription(index)}
                  />
                </Space>
              ))}
              <Button
                block
                icon={<PlusOutlined />}
                type="dashed"
                onClick={handleAddSkillDescription}
              >
                {t('resumeEditor.addSkillDescription')}
              </Button>
            </Card>

            {/* 技能 */}
            <Card className="mb-4" title={t('resumeEditor.skills')}>
              {data.basicInfo.skills.map((skill, categoryIndex) => (
                <div key={categoryIndex} className="mb-4 p-4 border rounded">
                  <Space align="baseline" className="mb-2">
                    <Form.Item
                      noStyle
                      label={t('resumeEditor.skillCategory')}
                      name={['basicInfo', 'skills', categoryIndex, 'category']}
                    >
                      <Input placeholder="技能类别" />
                    </Form.Item>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => handleDeleteSkillCategory(categoryIndex)}
                    />
                  </Space>

                  {skill.items.map((_, itemIndex) => (
                    <Space key={itemIndex} align="baseline" className="mb-2">
                      <Form.Item
                        noStyle
                        name={['basicInfo', 'skills', categoryIndex, 'items', itemIndex]}
                      >
                        <Input placeholder={t('resumeEditor.skillItem')} style={{ width: 200 }} />
                      </Form.Item>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        type="text"
                        onClick={() => handleDeleteSkillItem(categoryIndex, itemIndex)}
                      />
                      <Button
                        icon={<PlusOutlined />}
                        type="text"
                        onClick={() => handleAddSkillItem(categoryIndex)}
                      />
                    </Space>
                  ))}
                </div>
              ))}
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddSkillCategory}>
                {t('resumeEditor.addSkillCategory')}
              </Button>
            </Card>

            {/* 工作经历 */}
            <Card className="mb-4" title={t('resumeEditor.workExperience')}>
              {data.experience.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space align="baseline" className="mb-2">
                    <Text strong>
                      {t('resumeEditor.workExperience')} {index + 1}
                    </Text>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => handleDeleteExperience(index)}
                    />
                  </Space>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.company')}
                    name={['experience', index, 'company']}
                  >
                    <Input className="mb-2" placeholder="公司名称" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.position')}
                    name={['experience', index, 'position']}
                  >
                    <Input className="mb-2" placeholder="职位" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.period')}
                    name={['experience', index, 'period']}
                  >
                    <Input className="mb-2" placeholder="2024.01 - 2024.12" />
                  </Form.Item>
                </div>
              ))}
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddExperience}>
                {t('resumeEditor.addWorkExperience')}
              </Button>
            </Card>

            {/* 项目经历 */}
            <Card className="mb-4" title={t('resumeEditor.projectExperience')}>
              {data.projects.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space align="baseline" className="mb-2">
                    <Text strong>
                      {t('resumeEditor.projects')} {index + 1}
                    </Text>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => handleDeleteProject(index)}
                    />
                  </Space>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.projectName')}
                    name={['projects', index, 'name']}
                  >
                    <Input className="mb-2" placeholder="项目名称" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.timePeriod')}
                    name={['projects', index, 'period']}
                  >
                    <Input className="mb-2" placeholder="2024.01 - 2024.12" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.projectDescription')}
                    name={['projects', index, 'description']}
                  >
                    <TextArea className="mb-2" placeholder="项目描述" rows={3} />
                  </Form.Item>
                </div>
              ))}
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddProject}>
                {t('resumeEditor.addProjectExperience')}
              </Button>
            </Card>

            {/* 教育经历 */}
            <Card className="mb-4" title={t('resumeEditor.education')}>
              {data.education.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space align="baseline" className="mb-2">
                    <Text strong>
                      {t('resumeEditor.education')} {index + 1}
                    </Text>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => handleDeleteEducation(index)}
                    />
                  </Space>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.school')}
                    name={['education', index, 'school']}
                  >
                    <Input className="mb-2" placeholder="学校名称" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.degree')}
                    name={['education', index, 'degree']}
                  >
                    <Input className="mb-2" placeholder="学历" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.timePeriod')}
                    name={['education', index, 'period']}
                  >
                    <Input className="mb-2" placeholder="2024.01 - 2024.12" />
                  </Form.Item>
                </div>
              ))}
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddEducation}>
                {t('resumeEditor.addEducation')}
              </Button>
            </Card>

            {/* 网站链接 */}
            <Card className="mb-4" title={t('resumeEditor.websites')}>
              {data.website.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <Space align="baseline" className="mb-2">
                    <Text strong>
                      {t('resumeEditor.websites')} {index + 1}
                    </Text>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={() => handleDeleteWebsite(index)}
                    />
                  </Space>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.websiteName')}
                    name={['website', index, 'name']}
                  >
                    <Input className="mb-2" placeholder="网站名称" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('resumeEditor.websiteUrl')}
                    name={['website', index, 'url']}
                  >
                    <Input className="mb-2" placeholder="https://example.com" />
                  </Form.Item>
                </div>
              ))}
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddWebsite}>
                {t('resumeEditor.addWebsite')}
              </Button>
            </Card>
          </Form>
        )}
      </div>

      <Modal
        closable={false}
        maskClosable={false}
        open={unsavedDialogOpen}
        title={t('resumeEditor.profile.unsavedTitle')}
        footer={[
          <Button key="cancel" onClick={cancelPendingAction}>
            {t('resumeEditor.profile.cancel')}
          </Button>,
          <Button key="discard" danger onClick={confirmDiscardAndContinue}>
            {t('resumeEditor.profile.discardAndContinue')}
          </Button>,
          <Button key="save" loading={loading} type="primary" onClick={confirmSaveAndContinue}>
            {t('resumeEditor.profile.saveAndContinue')}
          </Button>,
        ]}
      >
        {t('resumeEditor.profile.unsavedDescription')}
      </Modal>
    </div>
  );
};

export default ResumeEditor;

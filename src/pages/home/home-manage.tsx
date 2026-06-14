import {
  Button,
  Form,
  Input,
  Card,
  Space,
  Typography,
  InputNumber,
  Modal,
  Result,
  Spin,
} from 'antd';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import HomeProfileToolbar from '@/components/home-profile-toolbar';
import HomeSkillHighlightsEditor from '@/components/home-skill-highlights-editor';
import useHomeManage from '@/hooks/use-home-manage';

const { TextArea } = Input;
const { Title, Text } = Typography;

const HomeManage = () => {
  const {
    form,
    catalog,
    data,
    loading,
    error,
    isDirty,
    selectedHomeId,
    selectedLanguage,
    unsavedDialogOpen,
    markDirty,
    selectHome,
    selectLanguage,
    createHome,
    copyHome,
    renameHome,
    deleteHome,
    setActiveHome,
    retry,
    confirmSaveAndContinue,
    confirmDiscardAndContinue,
    cancelPendingAction,
    handleSave,
    handleAddSkill,
    handleDeleteSkill,
    handleMoveSkill,
    handleAddSkillHighlight,
    handleDeleteSkillHighlight,
    handleMoveSkillHighlight,
    handleAddExperience,
    handleDeleteExperience,
    handleMoveExperience,
    handleAddProject,
    handleDeleteProject,
    handleMoveProject,
  } = useHomeManage();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Title className="mb-6" level={2}>
          {t('homeManage.title')}
        </Title>

        {catalog && (
          <Card className="mb-4">
            <HomeProfileToolbar
              catalog={catalog}
              isDirty={isDirty}
              loading={loading}
              selectedHomeId={selectedHomeId}
              selectedLanguage={selectedLanguage}
              onCopyHome={copyHome}
              onCreateHome={createHome}
              onDeleteHome={deleteHome}
              onRenameHome={renameHome}
              onSelectHome={selectHome}
              onSelectLanguage={selectLanguage}
              onSetActiveHome={setActiveHome}
            />
          </Card>
        )}

        <Card className="mb-4">
          <Space>
            <Button icon={<SaveOutlined />} loading={loading} type="primary" onClick={handleSave}>
              {t('homeManage.save')}
            </Button>
            <Link to="/">
              <Button icon={<EyeOutlined />} type="default">
                {t('homeManage.preview')}
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
            extra={<Button onClick={retry}>{t('homeManage.profile.retry')}</Button>}
            status="error"
            subTitle={error}
            title={t('homeManage.profile.loadFailed')}
          />
        )}

        {data && (
          <Form form={form} initialValues={data} layout="vertical" onValuesChange={markDirty}>
            <Card className="mb-4" title={t('homeManage.hero')}>
              <Form.Item
                label={t('homeManage.occupation')}
                name="occupation"
                rules={[{ required: true }]}
              >
                <Input placeholder={t('homeManage.occupation')} />
              </Form.Item>
              <Form.Item
                label={t('homeManage.heroDescription')}
                name="description"
                rules={[{ required: true }]}
              >
                <TextArea placeholder={t('homeManage.heroDescription')} rows={3} />
              </Form.Item>
            </Card>
            <Card className="mb-4" title={t('homeManage.skillHighlights')}>
              <HomeSkillHighlightsEditor
                highlights={data.skillHighlights}
                onAdd={handleAddSkillHighlight}
                onDelete={handleDeleteSkillHighlight}
                onMove={handleMoveSkillHighlight}
              />
            </Card>
            {/* 技能 */}
            <Card className="mb-4" title={t('homeManage.skills')}>
              {data.skills.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <Text strong>
                      {t('homeManage.skill')} {index + 1}
                    </Text>
                    <Space>
                      <Button
                        aria-label={t('homeManage.moveSkillUp')}
                        disabled={index === 0}
                        icon={<ArrowUpOutlined />}
                        type="text"
                        onClick={() => handleMoveSkill(index, -1)}
                      />
                      <Button
                        aria-label={t('homeManage.moveSkillDown')}
                        disabled={index === data.skills.length - 1}
                        icon={<ArrowDownOutlined />}
                        type="text"
                        onClick={() => handleMoveSkill(index, 1)}
                      />
                      <Button
                        danger
                        aria-label={t('homeManage.deleteSkill')}
                        icon={<DeleteOutlined />}
                        type="text"
                        onClick={() => handleDeleteSkill(index)}
                      />
                    </Space>
                  </div>

                  <Space.Compact block className="mb-2">
                    <Form.Item
                      noStyle
                      label={t('homeManage.skillName')}
                      name={['skills', index, 'name']}
                      rules={[{ required: true, message: '请输入技能名称' }]}
                    >
                      <Input placeholder="技能名称" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      label={t('homeManage.proficiency')}
                      name={['skills', index, 'value']}
                      rules={[{ required: true, message: '请输入熟练度' }]}
                    >
                      <InputNumber max={100} min={0} placeholder="0-100" style={{ width: 100 }} />
                    </Form.Item>
                  </Space.Compact>
                </div>
              ))}
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddSkill}>
                {t('homeManage.addSkill')}
              </Button>
            </Card>

            {/* 工作经历 */}
            <Card className="mb-4" title={t('homeManage.experience')}>
              {data.experiences.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <Text strong>
                      {t('homeManage.experience')} {index + 1}
                    </Text>
                    <Space>
                      <Button
                        aria-label={t('homeManage.moveExperienceUp')}
                        disabled={index === 0}
                        icon={<ArrowUpOutlined />}
                        type="text"
                        onClick={() => handleMoveExperience(index, -1)}
                      />
                      <Button
                        aria-label={t('homeManage.moveExperienceDown')}
                        disabled={index === data.experiences.length - 1}
                        icon={<ArrowDownOutlined />}
                        type="text"
                        onClick={() => handleMoveExperience(index, 1)}
                      />
                      <Button
                        danger
                        aria-label={t('homeManage.deleteExperience')}
                        icon={<DeleteOutlined />}
                        type="text"
                        onClick={() => handleDeleteExperience(index)}
                      />
                    </Space>
                  </div>

                  <Form.Item
                    noStyle
                    label={t('homeManage.year')}
                    name={['experiences', index, 'year']}
                    rules={[{ required: true, message: '请输入时间段' }]}
                  >
                    <Input className="mb-2" placeholder="2022 - 至今" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('homeManage.company')}
                    name={['experiences', index, 'company']}
                    rules={[{ required: true, message: '请输入公司名称' }]}
                  >
                    <Input className="mb-2" placeholder="公司名称" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('homeManage.position')}
                    name={['experiences', index, 'title']}
                    rules={[{ required: true, message: '请输入职位' }]}
                  >
                    <Input className="mb-2" placeholder="职位" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('homeManage.description')}
                    name={['experiences', index, 'description']}
                    rules={[{ required: true, message: '请输入工作描述' }]}
                  >
                    <TextArea placeholder="工作描述" rows={3} />
                  </Form.Item>
                </div>
              ))}
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddExperience}>
                {t('homeManage.addExperience')}
              </Button>
            </Card>

            {/* 项目 */}
            <Card className="mb-4" title={t('homeManage.projects')}>
              {data.projects.map((_, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <Text strong>
                      {t('homeManage.projects')} {index + 1}
                    </Text>
                    <Space>
                      <Button
                        aria-label={t('homeManage.moveProjectUp')}
                        disabled={index === 0}
                        icon={<ArrowUpOutlined />}
                        type="text"
                        onClick={() => handleMoveProject(index, -1)}
                      />
                      <Button
                        aria-label={t('homeManage.moveProjectDown')}
                        disabled={index === data.projects.length - 1}
                        icon={<ArrowDownOutlined />}
                        type="text"
                        onClick={() => handleMoveProject(index, 1)}
                      />
                      <Button
                        danger
                        aria-label={t('homeManage.deleteProject')}
                        icon={<DeleteOutlined />}
                        type="text"
                        onClick={() => handleDeleteProject(index)}
                      />
                    </Space>
                  </div>

                  <Form.Item
                    noStyle
                    label={t('homeManage.projectName')}
                    name={['projects', index, 'title']}
                    rules={[{ required: true, message: '请输入项目名称' }]}
                  >
                    <Input className="mb-2" placeholder="项目名称" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('homeManage.projectDescription')}
                    name={['projects', index, 'description']}
                    rules={[{ required: true, message: '请输入项目描述' }]}
                  >
                    <TextArea className="mb-2" placeholder="项目描述" rows={3} />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('homeManage.imagePath')}
                    name={['projects', index, 'image']}
                    rules={[{ required: true, message: '请输入图片路径' }]}
                  >
                    <Input className="mb-2" placeholder="portfolio1.jpg" />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    label={t('homeManage.projectLink')}
                    name={['projects', index, 'link']}
                    rules={[{ required: true, message: '请输入项目链接' }]}
                  >
                    <Input placeholder="#" />
                  </Form.Item>
                </div>
              ))}
              <Button block icon={<PlusOutlined />} type="dashed" onClick={handleAddProject}>
                {t('homeManage.addProject')}
              </Button>
            </Card>
          </Form>
        )}
      </div>
      <Modal
        closable={false}
        maskClosable={false}
        open={unsavedDialogOpen}
        title={t('homeManage.profile.unsavedTitle')}
        footer={[
          <Button key="cancel" onClick={cancelPendingAction}>
            {t('homeManage.profile.cancel')}
          </Button>,
          <Button key="discard" danger onClick={confirmDiscardAndContinue}>
            {t('homeManage.profile.discardAndContinue')}
          </Button>,
          <Button key="save" type="primary" onClick={confirmSaveAndContinue}>
            {t('homeManage.profile.saveAndContinue')}
          </Button>,
        ]}
      >
        {t('homeManage.profile.unsavedDescription')}
      </Modal>
    </div>
  );
};

export default HomeManage;

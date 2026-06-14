import { useMemo, useState } from 'react';

import { Button, Flex, Input, Modal, Select, Tag, Typography } from 'antd';

import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import type { ResumeCatalog, ResumeLanguage } from '@/types/resume';

interface ResumeProfileToolbarProps {
  catalog: ResumeCatalog;
  selectedResumeId: string;
  selectedLanguage: ResumeLanguage;
  isDirty: boolean;
  loading: boolean;
  onSelectResume: (resumeId: string) => void;
  onSelectLanguage: (language: ResumeLanguage) => void;
  onCreateResume: (name: string) => void;
  onCopyResume: (name: string) => void;
  onRenameResume: (name: string) => void;
  onDeleteResume: () => void;
  onSetActiveResume: () => void;
}

type NameOperation = 'create' | 'copy' | 'rename';

const ResumeProfileToolbar = ({
  catalog,
  selectedResumeId,
  selectedLanguage,
  isDirty,
  loading,
  onSelectResume,
  onSelectLanguage,
  onCreateResume,
  onCopyResume,
  onRenameResume,
  onDeleteResume,
  onSetActiveResume,
}: ResumeProfileToolbarProps) => {
  const { t } = useTranslation();
  const [nameOperation, setNameOperation] = useState<NameOperation | null>(null);
  const [resumeName, setResumeName] = useState('');
  const selectedResume = catalog.resumes.find((resume) => resume.id === selectedResumeId);
  const isActive = catalog.activeResumeId === selectedResumeId;
  const canDelete = !isActive && catalog.resumes.length > 1;

  const resumeOptions = useMemo(
    () =>
      catalog.resumes.map((resume) => ({
        value: resume.id,
        label:
          resume.id === catalog.activeResumeId
            ? `${resume.name} (${t('resumeEditor.profile.active')})`
            : resume.name,
      })),
    [catalog.activeResumeId, catalog.resumes, t],
  );

  const languageOptions = [
    { value: 'zh-CN', label: t('resumeEditor.language.zhCN') },
    { value: 'en-US', label: t('resumeEditor.language.enUS') },
    { value: 'ja-JP', label: t('resumeEditor.language.jaJP') },
  ];

  const openNameModal = (operation: NameOperation) => {
    setNameOperation(operation);
    setResumeName(operation === 'rename' ? (selectedResume?.name ?? '') : '');
  };

  const closeNameModal = () => {
    setNameOperation(null);
    setResumeName('');
  };

  const submitNameOperation = () => {
    const normalizedName = resumeName.trim();
    if (!normalizedName || !nameOperation) return;

    if (nameOperation === 'create') onCreateResume(normalizedName);
    if (nameOperation === 'copy') onCopyResume(normalizedName);
    if (nameOperation === 'rename') onRenameResume(normalizedName);
    closeNameModal();
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t('resumeEditor.profile.deleteTitle'),
      content: t('resumeEditor.profile.deleteDescription', { name: selectedResume?.name }),
      okText: t('resumeEditor.profile.delete'),
      okButtonProps: { danger: true },
      cancelText: t('resumeEditor.profile.cancel'),
      onOk: onDeleteResume,
    });
  };

  return (
    <>
      <Flex wrap align="center" gap="small" justify="space-between">
        <Flex wrap align="center" gap="small">
          <Typography.Text strong>{t('resumeEditor.profile.label')}</Typography.Text>
          <Select
            aria-label={t('resumeEditor.profile.label')}
            className="min-w-48"
            loading={loading}
            options={resumeOptions}
            value={selectedResumeId}
            onChange={onSelectResume}
          />
          <Typography.Text strong>{t('resumeEditor.language.label')}</Typography.Text>
          <Select
            aria-label={t('resumeEditor.language.label')}
            className="min-w-32"
            options={languageOptions}
            value={selectedLanguage}
            onChange={onSelectLanguage}
          />
          {isActive && <Tag color="green">{t('resumeEditor.profile.active')}</Tag>}
          {isDirty && <Tag color="orange">{t('resumeEditor.profile.unsaved')}</Tag>}
        </Flex>

        <Flex wrap gap="small">
          <Button
            disabled={isActive}
            icon={<StarOutlined />}
            loading={loading}
            onClick={onSetActiveResume}
          >
            {t('resumeEditor.profile.setActive')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => openNameModal('create')}>
            {t('resumeEditor.profile.create')}
          </Button>
          <Button icon={<CopyOutlined />} onClick={() => openNameModal('copy')}>
            {t('resumeEditor.profile.copy')}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openNameModal('rename')}>
            {t('resumeEditor.profile.rename')}
          </Button>
          <Button danger disabled={!canDelete} icon={<DeleteOutlined />} onClick={handleDelete}>
            {t('resumeEditor.profile.delete')}
          </Button>
        </Flex>
      </Flex>

      <Modal
        destroyOnHidden
        cancelText={t('resumeEditor.profile.cancel')}
        okButtonProps={{ disabled: !resumeName.trim() }}
        okText={t('resumeEditor.profile.confirm')}
        open={nameOperation !== null}
        title={nameOperation ? t(`resumeEditor.profile.${nameOperation}Title`) : ''}
        onCancel={closeNameModal}
        onOk={submitNameOperation}
      >
        <Input
          autoFocus
          maxLength={50}
          placeholder={t('resumeEditor.profile.namePlaceholder')}
          value={resumeName}
          onChange={(event) => setResumeName(event.target.value)}
          onPressEnter={submitNameOperation}
        />
      </Modal>
    </>
  );
};

export default ResumeProfileToolbar;

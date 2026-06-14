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

import type { HomeCatalog, HomeLanguage } from '@/types';

interface HomeProfileToolbarProps {
  catalog: HomeCatalog;
  selectedHomeId: string;
  selectedLanguage: HomeLanguage;
  isDirty: boolean;
  loading: boolean;
  onSelectHome: (id: string) => void;
  onSelectLanguage: (language: HomeLanguage) => void;
  onCreateHome: (name: string) => void;
  onCopyHome: (name: string) => void;
  onRenameHome: (name: string) => void;
  onDeleteHome: () => void;
  onSetActiveHome: () => void;
}

type Operation = 'create' | 'copy' | 'rename';

const HomeProfileToolbar = (props: HomeProfileToolbarProps) => {
  const { t } = useTranslation();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [name, setName] = useState('');
  const selected = props.catalog.homes.find((home) => home.id === props.selectedHomeId);
  const isActive = props.catalog.activeHomeId === props.selectedHomeId;
  const options = useMemo(
    () =>
      props.catalog.homes.map((home) => ({
        value: home.id,
        label:
          home.id === props.catalog.activeHomeId
            ? `${home.name} (${t('homeManage.profile.active')})`
            : home.name,
      })),
    [props.catalog.activeHomeId, props.catalog.homes, t],
  );

  const open = (next: Operation) => {
    setOperation(next);
    setName(next === 'rename' ? (selected?.name ?? '') : '');
  };
  const submit = () => {
    const value = name.trim();
    if (!value || !operation) return;
    if (operation === 'create') props.onCreateHome(value);
    if (operation === 'copy') props.onCopyHome(value);
    if (operation === 'rename') props.onRenameHome(value);
    setOperation(null);
  };

  return (
    <>
      <Flex wrap align="center" gap="small" justify="space-between">
        <Flex wrap align="center" gap="small">
          <Typography.Text strong>{t('homeManage.profile.label')}</Typography.Text>
          <Select
            className="min-w-48"
            options={options}
            value={props.selectedHomeId}
            onChange={props.onSelectHome}
          />
          <Typography.Text strong>{t('homeManage.language.label')}</Typography.Text>
          <Select
            className="min-w-32"
            value={props.selectedLanguage}
            options={[
              { value: 'zh-CN', label: t('homeManage.language.zhCN') },
              { value: 'en-US', label: t('homeManage.language.enUS') },
              { value: 'ja-JP', label: t('homeManage.language.jaJP') },
            ]}
            onChange={props.onSelectLanguage}
          />
          {isActive && <Tag color="green">{t('homeManage.profile.active')}</Tag>}
          {props.isDirty && <Tag color="orange">{t('homeManage.profile.unsaved')}</Tag>}
        </Flex>
        <Flex wrap gap="small">
          <Button disabled={isActive} icon={<StarOutlined />} onClick={props.onSetActiveHome}>
            {t('homeManage.profile.setActive')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => open('create')}>
            {t('homeManage.profile.create')}
          </Button>
          <Button icon={<CopyOutlined />} onClick={() => open('copy')}>
            {t('homeManage.profile.copy')}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => open('rename')}>
            {t('homeManage.profile.rename')}
          </Button>
          <Button
            danger
            disabled={isActive || props.catalog.homes.length === 1}
            icon={<DeleteOutlined />}
            onClick={() =>
              Modal.confirm({
                title: t('homeManage.profile.deleteTitle'),
                content: t('homeManage.profile.deleteDescription', { name: selected?.name }),
                okButtonProps: { danger: true },
                onOk: props.onDeleteHome,
              })
            }
          >
            {t('homeManage.profile.delete')}
          </Button>
        </Flex>
      </Flex>
      <Modal
        okButtonProps={{ disabled: !name.trim() }}
        open={operation !== null}
        title={operation ? t(`homeManage.profile.${operation}Title`) : ''}
        onCancel={() => setOperation(null)}
        onOk={submit}
      >
        <Input
          placeholder={t('homeManage.profile.namePlaceholder')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onPressEnter={submit}
        />
      </Modal>
    </>
  );
};

export default HomeProfileToolbar;

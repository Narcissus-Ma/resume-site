import { Button, Form, Input, Select, Space, Typography } from 'antd';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import type { SkillHighlight } from '@/types';

const { TextArea } = Input;
const { Text } = Typography;

interface HomeSkillHighlightsEditorProps {
  highlights: SkillHighlight[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onMove: (index: number, offset: -1 | 1) => void;
}

const HomeSkillHighlightsEditor = ({
  highlights,
  onAdd,
  onDelete,
  onMove,
}: HomeSkillHighlightsEditorProps) => {
  const { t } = useTranslation();
  const iconOptions = [
    { value: 'code', label: t('homeManage.skillHighlightIcons.code') },
    { value: 'database', label: t('homeManage.skillHighlightIcons.database') },
    { value: 'design', label: t('homeManage.skillHighlightIcons.design') },
    { value: 'agent', label: t('homeManage.skillHighlightIcons.agent') },
    { value: 'tool', label: t('homeManage.skillHighlightIcons.tool') },
  ];

  return (
    <>
      <Form.Item label={t('homeManage.skillSectionDescription')} name="skillSectionDescription">
        <TextArea placeholder={t('homeManage.skillSectionDescriptionPlaceholder')} rows={3} />
      </Form.Item>

      {highlights.map((highlight, index) => (
        <div key={highlight.id} className="mb-4 rounded border p-4">
          <Form.Item hidden name={['skillHighlights', index, 'id']}>
            <Input />
          </Form.Item>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Text strong>
              {t('homeManage.skillHighlight')} {index + 1}
            </Text>
            <Space>
              <Button
                aria-label={t('homeManage.moveSkillHighlightUp')}
                disabled={index === 0}
                icon={<ArrowUpOutlined />}
                type="text"
                onClick={() => onMove(index, -1)}
              />
              <Button
                aria-label={t('homeManage.moveSkillHighlightDown')}
                disabled={index === highlights.length - 1}
                icon={<ArrowDownOutlined />}
                type="text"
                onClick={() => onMove(index, 1)}
              />
              <Button
                danger
                aria-label={t('homeManage.deleteSkillHighlight')}
                icon={<DeleteOutlined />}
                type="text"
                onClick={() => onDelete(index)}
              />
            </Space>
          </div>

          <Form.Item
            label={t('homeManage.skillHighlightIcon')}
            name={['skillHighlights', index, 'icon']}
            rules={[{ required: true, message: t('homeManage.skillHighlightIconRequired') }]}
          >
            <Select options={iconOptions} />
          </Form.Item>
          <Form.Item
            label={t('homeManage.skillHighlightTitle')}
            name={['skillHighlights', index, 'title']}
            rules={[{ required: true, message: t('homeManage.skillHighlightTitleRequired') }]}
          >
            <Input placeholder={t('homeManage.skillHighlightTitlePlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('homeManage.skillHighlightDescription')}
            name={['skillHighlights', index, 'description']}
            rules={[{ required: true, message: t('homeManage.skillHighlightDescriptionRequired') }]}
          >
            <TextArea placeholder={t('homeManage.skillHighlightDescriptionPlaceholder')} rows={3} />
          </Form.Item>
        </div>
      ))}

      <Button block icon={<PlusOutlined />} type="dashed" onClick={onAdd}>
        {t('homeManage.addSkillHighlight')}
      </Button>
    </>
  );
};

export default HomeSkillHighlightsEditor;

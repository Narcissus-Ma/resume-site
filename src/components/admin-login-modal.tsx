import { Form, Input, Modal } from 'antd';

import { useTranslation } from 'react-i18next';

interface AdminLoginModalProps {
  error: string | null;
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => Promise<void>;
}

const AdminLoginModal = ({ error, loading, open, onCancel, onSubmit }: AdminLoginModalProps) => {
  const [form] = Form.useForm<{ password: string }>();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    const { password } = await form.validateFields();
    await onSubmit(password);
  };

  return (
    <Modal
      destroyOnClose
      cancelText={t('adminAuth.cancel')}
      confirmLoading={loading}
      okText={t('adminAuth.login')}
      open={open}
      title={t('adminAuth.title')}
      onCancel={onCancel}
      onOk={() => void handleSubmit()}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          help={error}
          label={t('adminAuth.password')}
          name="password"
          rules={[{ required: true, message: t('adminAuth.passwordRequired') }]}
          validateStatus={error ? 'error' : undefined}
        >
          <Input.Password autoComplete="current-password" placeholder={t('adminAuth.password')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminLoginModal;

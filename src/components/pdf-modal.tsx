import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

Modal.setAppElement('#root');

interface FormData {
  name: string;
  phone: string;
  email: string;
}

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  correctToken?: string;
}

const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose, onSubmit, correctToken }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
  });
  const [tokens, setTokens] = useState<string>('');
  const [isTokenForm, setIsTokenForm] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokens(e.target.value);
  };

  const handleTokenValidation = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 简单验证token是否正确（这里移除了Base64解码逻辑）
      if (tokens === correctToken) {
        // 直接使用预设的正确信息
        setFormData({
          name: '张工',
          phone: '13800138000',
          email: 'zhanggong@example.com',
        });
        setIsTokenForm(false);
      } else {
        alert('Token验证失败，请检查输入是否正确');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      alert('Token验证失败，请检查输入是否正确');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      className="modal-content"
      isOpen={isOpen}
      overlayClassName="modal-overlay"
      onRequestClose={onClose}
    >
      <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">{t('pdfModal.title')}</h2>
        <div className="flex justify-end mb-4">
          <label className="flex items-center space-x-2">
            <span className="whitespace-nowrap">{t('pdfModal.useToken')}</span>
            <input
              checked={isTokenForm}
              className="form-switch"
              type="checkbox"
              onChange={() => setIsTokenForm(!isTokenForm)}
            />
          </label>
        </div>
        {isTokenForm ? (
          <form className="space-y-4" onSubmit={handleTokenValidation}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('pdfModal.tokenLabel')}
              </label>
              <input
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                name="tokens"
                type="text"
                value={tokens}
                onChange={handleTokenChange}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                type="button"
                onClick={onClose}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
                disabled={!tokens}
                type="submit"
              >
                {t('pdfModal.verifyToken')}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('pdfModal.nameLabel')}
              </label>
              <input
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('pdfModal.phoneLabel')}
              </label>
              <input
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('pdfModal.emailLabel')}
              </label>
              <input
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                type="button"
                onClick={onClose}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
                disabled={!formData.name || !formData.phone || !formData.email}
                type="submit"
              >
                {t('pdfModal.confirmInfo')}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default PDFModal;

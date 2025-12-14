import React, { useState } from "react";

import Modal from "react-modal";

import { resumeData } from "../data/resumeData";

Modal.setAppElement("#root");

interface FormData {
  name: string;
  phone: string;
  email: string;
}

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
  });
  const [tokens, setTokens] = useState<string>("");
  const [isTokenForm, setIsTokenForm] = useState<boolean>(true);

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
      if (tokens === resumeData.correctToken) {
        // 直接使用预设的正确信息
        setFormData({
          name: "张工",
          phone: "13800138000",
          email: "zhanggong@example.com"
        });
        setIsTokenForm(false);
      } else {
        alert("Token验证失败，请检查输入是否正确");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      alert("Token验证失败，请检查输入是否正确");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
     <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">导出简历</h2>
        <div className="flex justify-end mb-4">
          <label className="flex items-center space-x-2">
            <span className="whitespace-nowrap">输入口令或我的信息</span>
            <input
              type="checkbox"
              checked={isTokenForm}
              onChange={() => setIsTokenForm(!isTokenForm)}
              className="form-switch"
            />
          </label>
        </div>
        {isTokenForm ? (
          <form onSubmit={handleTokenValidation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                输入口令获取我的真实信息
              </label>
              <input
                type="text"
                name="tokens"
                value={tokens}
                onChange={handleTokenChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!tokens}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                验证口令
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                手机号
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                邮箱
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={
                  !formData.name ||
                  !formData.phone ||
                  !formData.email
                }
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                确认信息
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default PDFModal;
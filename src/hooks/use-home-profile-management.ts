import { useCallback, useEffect, useRef, useState } from 'react';

import { type FormInstance, message } from 'antd';

import { homeApi, HomeApiError } from '@/services/home-api';
import type { HomeCatalog, HomeData, HomeLanguage } from '@/types';

interface Options {
  form: FormInstance<HomeData>;
}

const errorMessage = (error: unknown) =>
  error instanceof HomeApiError ? error.message : '主页管理操作失败';

const findContent = (catalog: HomeCatalog, homeId: string, language: HomeLanguage): HomeData => {
  const home = catalog.homes.find((item) => item.id === homeId);
  if (!home) throw new Error('未找到指定主页岗位');
  return structuredClone(home.contents[language] ?? home.contents['zh-CN']);
};

const useHomeProfileManagement = ({ form }: Options) => {
  const [catalog, setCatalog] = useState<HomeCatalog | null>(null);
  const [data, setData] = useState<HomeData | null>(null);
  const [selectedHomeId, setSelectedHomeId] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<HomeLanguage>('zh-CN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const pendingAction = useRef<null | (() => Promise<void> | void)>(null);

  const applySelection = useCallback(
    (nextCatalog: HomeCatalog, homeId: string, language: HomeLanguage) => {
      const content = findContent(nextCatalog, homeId, language);
      setCatalog(nextCatalog);
      setSelectedHomeId(homeId);
      setSelectedLanguage(language);
      setData(content);
      form.resetFields();
      form.setFieldsValue(content);
      setIsDirty(false);
    },
    [form],
  );

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextCatalog = await homeApi.getCatalog();
      applySelection(nextCatalog, nextCatalog.activeHomeId, 'zh-CN');
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [applySelection]);

  useEffect(() => void loadCatalog(), [loadCatalog]);

  const saveCurrent = useCallback(async (): Promise<boolean> => {
    if (!catalog || !selectedHomeId) return false;
    try {
      setLoading(true);
      const content = await form.validateFields();
      const nextCatalog = await homeApi.updateContent({
        homeId: selectedHomeId,
        language: selectedLanguage,
        content,
      });
      applySelection(nextCatalog, selectedHomeId, selectedLanguage);
      message.success('保存成功');
      return true;
    } catch (saveError) {
      message.error(errorMessage(saveError));
      return false;
    } finally {
      setLoading(false);
    }
  }, [applySelection, catalog, form, selectedHomeId, selectedLanguage]);

  const protect = useCallback(
    (action: () => Promise<void> | void) => {
      if (!isDirty) return void action();
      pendingAction.current = action;
      setUnsavedDialogOpen(true);
    },
    [isDirty],
  );

  const selectHome = useCallback(
    (homeId: string) => {
      if (!catalog || homeId === selectedHomeId) return;
      protect(async () => applySelection(await homeApi.getCatalog(), homeId, selectedLanguage));
    },
    [applySelection, catalog, protect, selectedHomeId, selectedLanguage],
  );

  const selectLanguage = useCallback(
    (language: HomeLanguage) => {
      if (!catalog || language === selectedLanguage) return;
      protect(async () => applySelection(await homeApi.getCatalog(), selectedHomeId, language));
    },
    [applySelection, catalog, protect, selectedHomeId, selectedLanguage],
  );

  const operation = useCallback(
    (request: () => Promise<HomeCatalog>, targetId = selectedHomeId) =>
      protect(async () => {
        try {
          setLoading(true);
          const nextCatalog = await request();
          applySelection(nextCatalog, targetId, selectedLanguage);
        } catch (operationError) {
          message.error(errorMessage(operationError));
        } finally {
          setLoading(false);
        }
      }),
    [applySelection, protect, selectedHomeId, selectedLanguage],
  );

  const createHome = useCallback(
    (name: string, mode: 'empty' | 'copy') =>
      protect(async () => {
        try {
          setLoading(true);
          const result = await homeApi.createHome({
            name,
            mode,
            sourceHomeId: mode === 'copy' ? selectedHomeId : undefined,
          });
          applySelection(result.catalog, result.homeId, 'zh-CN');
        } catch (operationError) {
          message.error(errorMessage(operationError));
        } finally {
          setLoading(false);
        }
      }),
    [applySelection, protect, selectedHomeId],
  );

  const confirmSaveAndContinue = useCallback(async () => {
    if (!(await saveCurrent())) return;
    const action = pendingAction.current;
    pendingAction.current = null;
    setUnsavedDialogOpen(false);
    await action?.();
  }, [saveCurrent]);

  const confirmDiscardAndContinue = useCallback(async () => {
    const action = pendingAction.current;
    pendingAction.current = null;
    setUnsavedDialogOpen(false);
    await action?.();
  }, []);

  return {
    catalog,
    data,
    selectedHomeId,
    selectedLanguage,
    loading,
    error,
    isDirty,
    unsavedDialogOpen,
    updateData: (nextData: HomeData) => {
      setData(nextData);
      form.setFieldsValue(nextData);
      setIsDirty(true);
    },
    markDirty: () => setIsDirty(true),
    handleSave: saveCurrent,
    selectHome,
    selectLanguage,
    createHome: (name: string) => createHome(name, 'empty'),
    copyHome: (name: string) => createHome(name, 'copy'),
    renameHome: (name: string) => operation(() => homeApi.renameHome(selectedHomeId, name)),
    deleteHome: () =>
      operation(() => homeApi.deleteHome(selectedHomeId), catalog?.activeHomeId ?? selectedHomeId),
    setActiveHome: () => operation(() => homeApi.setActiveHome(selectedHomeId)),
    retry: loadCatalog,
    confirmSaveAndContinue,
    confirmDiscardAndContinue,
    cancelPendingAction: () => {
      pendingAction.current = null;
      setUnsavedDialogOpen(false);
    },
  };
};

export default useHomeProfileManagement;

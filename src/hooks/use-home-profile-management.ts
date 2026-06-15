import { useCallback, useEffect, useRef, useState } from 'react';

import { type FormInstance, message } from 'antd';

import { useTranslation } from 'react-i18next';

import {
  beginManagementSave,
  completeManagementSave,
  type ManagementSaveResult,
} from '@/domain/admin/management-state';
import { homeApi, HomeApiError } from '@/services/home-api';
import type { HomeCatalog, HomeCatalogResponse, HomeData, HomeLanguage } from '@/types';

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
  const { t } = useTranslation();
  const [catalog, setCatalog] = useState<HomeCatalog | null>(null);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<HomeData | null>(null);
  const [selectedHomeId, setSelectedHomeId] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<HomeLanguage>('zh-CN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const pendingAction = useRef<null | (() => Promise<void> | void)>(null);
  const saving = useRef(false);

  const applySelection = useCallback(
    (nextCatalog: HomeCatalog, nextRevision: number, homeId: string, language: HomeLanguage) => {
      const content = findContent(nextCatalog, homeId, language);
      setCatalog(nextCatalog);
      setRevision(nextRevision);
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
      const response = await homeApi.getCatalog();
      applySelection(response.catalog, response.revision, response.catalog.activeHomeId, 'zh-CN');
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [applySelection]);

  useEffect(() => void loadCatalog(), [loadCatalog]);

  const saveCurrent = useCallback(async (): Promise<boolean> => {
    if (!catalog || !selectedHomeId) return false;
    const attempt = beginManagementSave({ isDirty, isSaving: saving.current });
    if (!attempt.accepted) return false;
    saving.current = true;
    try {
      setLoading(true);
      const content = await form.validateFields();
      const nextCatalog = await homeApi.updateContent({
        revision,
        homeId: selectedHomeId,
        language: selectedLanguage,
        content,
      });
      applySelection(nextCatalog.catalog, nextCatalog.revision, selectedHomeId, selectedLanguage);
      message.success(t('adminAuth.saveSuccess'));
      return true;
    } catch (saveError) {
      const result: ManagementSaveResult =
        saveError instanceof HomeApiError && saveError.code === 'CATALOG_VERSION_CONFLICT'
          ? 'revision-conflict'
          : saveError instanceof HomeApiError && saveError.status === 401
            ? 'unauthorized'
            : 'error';
      setIsDirty(completeManagementSave(attempt.state, result).isDirty);
      message.error(errorMessage(saveError));
      return false;
    } finally {
      saving.current = false;
      setLoading(false);
    }
  }, [applySelection, catalog, form, isDirty, revision, selectedHomeId, selectedLanguage, t]);

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
      protect(async () => {
        const response = await homeApi.getCatalog();
        applySelection(response.catalog, response.revision, homeId, selectedLanguage);
      });
    },
    [applySelection, catalog, protect, selectedHomeId, selectedLanguage],
  );

  const selectLanguage = useCallback(
    (language: HomeLanguage) => {
      if (!catalog || language === selectedLanguage) return;
      protect(async () => {
        const response = await homeApi.getCatalog();
        applySelection(response.catalog, response.revision, selectedHomeId, language);
      });
    },
    [applySelection, catalog, protect, selectedHomeId, selectedLanguage],
  );

  const operation = useCallback(
    (request: () => Promise<HomeCatalogResponse>, targetId = selectedHomeId) =>
      protect(async () => {
        try {
          setLoading(true);
          const response = await request();
          applySelection(response.catalog, response.revision, targetId, selectedLanguage);
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
            revision,
            name,
            mode,
            sourceHomeId: mode === 'copy' ? selectedHomeId : undefined,
          });
          applySelection(result.catalog, result.revision, result.homeId, 'zh-CN');
        } catch (operationError) {
          message.error(errorMessage(operationError));
        } finally {
          setLoading(false);
        }
      }),
    [applySelection, protect, revision, selectedHomeId],
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
    renameHome: (name: string) =>
      operation(() => homeApi.renameHome(selectedHomeId, name, revision)),
    deleteHome: () =>
      operation(
        () => homeApi.deleteHome(selectedHomeId, revision),
        catalog?.activeHomeId ?? selectedHomeId,
      ),
    setActiveHome: () => operation(() => homeApi.setActiveHome(selectedHomeId, revision)),
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

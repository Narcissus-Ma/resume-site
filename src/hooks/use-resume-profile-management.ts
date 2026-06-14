import { useCallback, useEffect, useRef, useState } from 'react';

import { type FormInstance, message } from 'antd';

import { resumeApi, ResumeApiError } from '@/services/resume-api';
import type { ResumeCatalog, ResumeData, ResumeLanguage } from '@/types/resume';

interface UseResumeProfileManagementOptions {
  form: FormInstance<ResumeData>;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof ResumeApiError ? error.message : '简历管理操作失败';

const findContent = (
  catalog: ResumeCatalog,
  resumeId: string,
  language: ResumeLanguage,
): ResumeData => {
  const profile = catalog.resumes.find((resume) => resume.id === resumeId);

  if (!profile) {
    throw new Error('未找到指定岗位简历');
  }

  return structuredClone(profile.contents[language] ?? profile.contents['zh-CN']);
};

const useResumeProfileManagement = ({ form }: UseResumeProfileManagementOptions) => {
  const [catalog, setCatalog] = useState<ResumeCatalog | null>(null);
  const [data, setData] = useState<ResumeData | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<ResumeLanguage>('zh-CN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const pendingActionRef = useRef<null | (() => Promise<void> | void)>(null);

  const applySelection = useCallback(
    (nextCatalog: ResumeCatalog, resumeId: string, language: ResumeLanguage) => {
      const content = findContent(nextCatalog, resumeId, language);
      setCatalog(nextCatalog);
      setSelectedResumeId(resumeId);
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
      const nextCatalog = await resumeApi.getCatalog();
      applySelection(nextCatalog, nextCatalog.activeResumeId, 'zh-CN');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [applySelection]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const saveCurrent = useCallback(async (): Promise<boolean> => {
    if (!catalog || !selectedResumeId) {
      return false;
    }

    try {
      setLoading(true);
      const content = await form.validateFields();
      const nextCatalog = await resumeApi.updateContent({
        resumeId: selectedResumeId,
        language: selectedLanguage,
        content,
      });
      applySelection(nextCatalog, selectedResumeId, selectedLanguage);
      message.success('保存成功');
      return true;
    } catch (saveError) {
      message.error(getErrorMessage(saveError));
      return false;
    } finally {
      setLoading(false);
    }
  }, [applySelection, catalog, form, selectedLanguage, selectedResumeId]);

  const runProtectedAction = useCallback(
    (action: () => Promise<void> | void) => {
      if (!isDirty) {
        void action();
        return;
      }

      pendingActionRef.current = action;
      setUnsavedDialogOpen(true);
    },
    [isDirty],
  );

  const selectResume = useCallback(
    (resumeId: string) => {
      if (!catalog || resumeId === selectedResumeId) return;

      runProtectedAction(async () => {
        const latestCatalog = await resumeApi.getCatalog();
        applySelection(latestCatalog, resumeId, selectedLanguage);
      });
    },
    [applySelection, catalog, runProtectedAction, selectedLanguage, selectedResumeId],
  );

  const selectLanguage = useCallback(
    (language: ResumeLanguage) => {
      if (!catalog || language === selectedLanguage) return;

      runProtectedAction(async () => {
        const latestCatalog = await resumeApi.getCatalog();
        applySelection(latestCatalog, selectedResumeId, language);
      });
    },
    [applySelection, catalog, runProtectedAction, selectedLanguage, selectedResumeId],
  );

  const runCatalogOperation = useCallback(
    (operation: () => Promise<ResumeCatalog>, onSuccess: (nextCatalog: ResumeCatalog) => void) => {
      runProtectedAction(async () => {
        try {
          setLoading(true);
          const nextCatalog = await operation();
          onSuccess(nextCatalog);
        } catch (operationError) {
          message.error(getErrorMessage(operationError));
        } finally {
          setLoading(false);
        }
      });
    },
    [runProtectedAction],
  );

  const createResume = useCallback(
    (name: string) => {
      runProtectedAction(async () => {
        try {
          setLoading(true);
          const result = await resumeApi.createResume({ name, mode: 'empty' });
          applySelection(result.catalog, result.resumeId, 'zh-CN');
          message.success('岗位简历创建成功');
        } catch (operationError) {
          message.error(getErrorMessage(operationError));
        } finally {
          setLoading(false);
        }
      });
    },
    [applySelection, runProtectedAction],
  );

  const copyResume = useCallback(
    (name: string) => {
      runProtectedAction(async () => {
        try {
          setLoading(true);
          const result = await resumeApi.createResume({
            name,
            mode: 'copy',
            sourceResumeId: selectedResumeId,
          });
          applySelection(result.catalog, result.resumeId, 'zh-CN');
          message.success('岗位简历复制成功');
        } catch (operationError) {
          message.error(getErrorMessage(operationError));
        } finally {
          setLoading(false);
        }
      });
    },
    [applySelection, runProtectedAction, selectedResumeId],
  );

  const renameResume = useCallback(
    (name: string) => {
      runCatalogOperation(
        () => resumeApi.renameResume(selectedResumeId, name),
        (nextCatalog) => applySelection(nextCatalog, selectedResumeId, selectedLanguage),
      );
    },
    [applySelection, runCatalogOperation, selectedLanguage, selectedResumeId],
  );

  const deleteResume = useCallback(() => {
    if (!catalog) return;

    runCatalogOperation(
      () => resumeApi.deleteResume(selectedResumeId),
      (nextCatalog) => applySelection(nextCatalog, nextCatalog.activeResumeId, selectedLanguage),
    );
  }, [applySelection, catalog, runCatalogOperation, selectedLanguage, selectedResumeId]);

  const setActiveResume = useCallback(() => {
    runCatalogOperation(
      () => resumeApi.setActiveResume(selectedResumeId),
      (nextCatalog) => applySelection(nextCatalog, selectedResumeId, selectedLanguage),
    );
  }, [applySelection, runCatalogOperation, selectedLanguage, selectedResumeId]);

  const confirmSaveAndContinue = useCallback(async () => {
    const saved = await saveCurrent();

    if (!saved) return;

    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setUnsavedDialogOpen(false);
    await action?.();
  }, [saveCurrent]);

  const confirmDiscardAndContinue = useCallback(async () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setUnsavedDialogOpen(false);
    await action?.();
  }, []);

  const cancelPendingAction = useCallback(() => {
    pendingActionRef.current = null;
    setUnsavedDialogOpen(false);
  }, []);

  const updateData = useCallback(
    (nextData: ResumeData) => {
      setData(nextData);
      form.setFieldsValue(nextData);
      setIsDirty(true);
    },
    [form],
  );

  return {
    catalog,
    data,
    selectedResumeId,
    selectedLanguage,
    loading,
    error,
    isDirty,
    unsavedDialogOpen,
    updateData,
    markDirty: () => setIsDirty(true),
    handleSave: saveCurrent,
    selectResume,
    selectLanguage,
    createResume,
    copyResume,
    renameResume,
    deleteResume,
    setActiveResume,
    retry: loadCatalog,
    confirmSaveAndContinue,
    confirmDiscardAndContinue,
    cancelPendingAction,
  };
};

export default useResumeProfileManagement;

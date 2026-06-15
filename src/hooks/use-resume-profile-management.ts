import { useCallback, useEffect, useRef, useState } from 'react';

import { type FormInstance, message } from 'antd';

import { useTranslation } from 'react-i18next';

import {
  beginManagementSave,
  completeManagementSave,
  type ManagementSaveResult,
} from '@/domain/admin/management-state';
import { resumeApi, ResumeApiError } from '@/services/resume-api';
import type {
  ResumeCatalog,
  ResumeCatalogResponse,
  ResumeData,
  ResumeLanguage,
} from '@/types/resume';

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
  const { t } = useTranslation();
  const [catalog, setCatalog] = useState<ResumeCatalog | null>(null);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<ResumeData | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<ResumeLanguage>('zh-CN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const pendingActionRef = useRef<null | (() => Promise<void> | void)>(null);
  const savingRef = useRef(false);

  const applySelection = useCallback(
    (
      nextCatalog: ResumeCatalog,
      nextRevision: number,
      resumeId: string,
      language: ResumeLanguage,
    ) => {
      const content = findContent(nextCatalog, resumeId, language);
      setCatalog(nextCatalog);
      setRevision(nextRevision);
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
      const response = await resumeApi.getCatalog();
      applySelection(response.catalog, response.revision, response.catalog.activeResumeId, 'zh-CN');
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
    const attempt = beginManagementSave({ isDirty, isSaving: savingRef.current });
    if (!attempt.accepted) return false;
    savingRef.current = true;

    try {
      setLoading(true);
      const content = await form.validateFields();
      const nextCatalog = await resumeApi.updateContent({
        revision,
        resumeId: selectedResumeId,
        language: selectedLanguage,
        content,
      });
      applySelection(nextCatalog.catalog, nextCatalog.revision, selectedResumeId, selectedLanguage);
      message.success(t('adminAuth.saveSuccess'));
      return true;
    } catch (saveError) {
      const result: ManagementSaveResult =
        saveError instanceof ResumeApiError && saveError.code === 'CATALOG_VERSION_CONFLICT'
          ? 'revision-conflict'
          : saveError instanceof ResumeApiError && saveError.status === 401
            ? 'unauthorized'
            : 'error';
      setIsDirty(completeManagementSave(attempt.state, result).isDirty);
      message.error(getErrorMessage(saveError));
      return false;
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  }, [applySelection, catalog, form, isDirty, revision, selectedLanguage, selectedResumeId, t]);

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
        const response = await resumeApi.getCatalog();
        applySelection(response.catalog, response.revision, resumeId, selectedLanguage);
      });
    },
    [applySelection, catalog, runProtectedAction, selectedLanguage, selectedResumeId],
  );

  const selectLanguage = useCallback(
    (language: ResumeLanguage) => {
      if (!catalog || language === selectedLanguage) return;

      runProtectedAction(async () => {
        const response = await resumeApi.getCatalog();
        applySelection(response.catalog, response.revision, selectedResumeId, language);
      });
    },
    [applySelection, catalog, runProtectedAction, selectedLanguage, selectedResumeId],
  );

  const runCatalogOperation = useCallback(
    (
      operation: () => Promise<ResumeCatalogResponse>,
      onSuccess: (response: ResumeCatalogResponse) => void,
    ) => {
      runProtectedAction(async () => {
        try {
          setLoading(true);
          onSuccess(await operation());
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
          const result = await resumeApi.createResume({ revision, name, mode: 'empty' });
          applySelection(result.catalog, result.revision, result.resumeId, 'zh-CN');
          message.success('岗位简历创建成功');
        } catch (operationError) {
          message.error(getErrorMessage(operationError));
        } finally {
          setLoading(false);
        }
      });
    },
    [applySelection, revision, runProtectedAction],
  );

  const copyResume = useCallback(
    (name: string) => {
      runProtectedAction(async () => {
        try {
          setLoading(true);
          const result = await resumeApi.createResume({
            revision,
            name,
            mode: 'copy',
            sourceResumeId: selectedResumeId,
          });
          applySelection(result.catalog, result.revision, result.resumeId, 'zh-CN');
          message.success('岗位简历复制成功');
        } catch (operationError) {
          message.error(getErrorMessage(operationError));
        } finally {
          setLoading(false);
        }
      });
    },
    [applySelection, revision, runProtectedAction, selectedResumeId],
  );

  const renameResume = useCallback(
    (name: string) => {
      runCatalogOperation(
        () => resumeApi.renameResume(selectedResumeId, name, revision),
        (response) =>
          applySelection(response.catalog, response.revision, selectedResumeId, selectedLanguage),
      );
    },
    [applySelection, revision, runCatalogOperation, selectedLanguage, selectedResumeId],
  );

  const deleteResume = useCallback(() => {
    if (!catalog) return;

    runCatalogOperation(
      () => resumeApi.deleteResume(selectedResumeId, revision),
      (response) =>
        applySelection(
          response.catalog,
          response.revision,
          response.catalog.activeResumeId,
          selectedLanguage,
        ),
    );
  }, [applySelection, catalog, revision, runCatalogOperation, selectedLanguage, selectedResumeId]);

  const setActiveResume = useCallback(() => {
    runCatalogOperation(
      () => resumeApi.setActiveResume(selectedResumeId, revision),
      (response) =>
        applySelection(response.catalog, response.revision, selectedResumeId, selectedLanguage),
    );
  }, [applySelection, revision, runCatalogOperation, selectedLanguage, selectedResumeId]);

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

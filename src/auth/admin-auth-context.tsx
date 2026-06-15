import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ADMIN_SESSION_INVALIDATED_EVENT,
  clearAdminSession,
  readAdminSession,
  saveAdminSession,
  type AdminSession,
} from './admin-session';
import AdminLoginModal from '../components/admin-login-modal';
import { adminAuthApi, AdminAuthApiError } from '../services/admin-auth-api';

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  requestLogin: () => Promise<boolean>;
  submitPassword: (password: string) => Promise<void>;
  cancelLogin: () => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const storage = typeof window === 'undefined' ? null : window.sessionStorage;
  const [session, setSession] = useState<AdminSession | null>(() =>
    storage ? readAdminSession(storage) : null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolver = useRef<((result: boolean) => void) | null>(null);

  const finishRequest = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  const logout = useCallback(() => {
    if (storage) clearAdminSession(storage);
    setSession(null);
  }, [storage]);

  useEffect(() => {
    const handleInvalidated = () => logout();
    window.addEventListener(ADMIN_SESSION_INVALIDATED_EVENT, handleInvalidated);
    return () => window.removeEventListener(ADMIN_SESSION_INVALIDATED_EVENT, handleInvalidated);
  }, [logout]);

  const requestLogin = useCallback((): Promise<boolean> => {
    if (session) return Promise.resolve(true);
    setError(null);
    setModalOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current?.(false);
      resolver.current = resolve;
    });
  }, [session]);

  const submitPassword = useCallback(
    async (password: string) => {
      setLoading(true);
      setError(null);
      try {
        const nextSession = await adminAuthApi.login(password);
        if (storage) saveAdminSession(storage, nextSession);
        setSession(nextSession);
        setModalOpen(false);
        finishRequest(true);
      } catch (loginError) {
        setError(
          loginError instanceof AdminAuthApiError ? loginError.message : '管理员登录服务暂时不可用',
        );
      } finally {
        setLoading(false);
      }
    },
    [finishRequest, storage],
  );

  const cancelLogin = useCallback(() => {
    setModalOpen(false);
    setError(null);
    finishRequest(false);
  }, [finishRequest]);

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: Boolean(session),
        loading,
        error,
        requestLogin,
        submitPassword,
        cancelLogin,
        logout,
      }}
    >
      {children}
      <AdminLoginModal
        error={error}
        loading={loading}
        open={modalOpen}
        onCancel={cancelLogin}
        onSubmit={submitPassword}
      />
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = (): AdminAuthContextValue => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth 必须在 AdminAuthProvider 中使用');
  return context;
};

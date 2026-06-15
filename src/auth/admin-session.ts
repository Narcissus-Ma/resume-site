export interface AdminSession {
  token: string;
  expiresAt: string;
}

const SESSION_KEY = 'resume-admin-session';
export const ADMIN_SESSION_INVALIDATED_EVENT = 'resume-admin-session-invalidated';

export const clearAdminSession = (storage: Storage): void => {
  storage.removeItem(SESSION_KEY);
};

export const saveAdminSession = (storage: Storage, session: AdminSession): void => {
  storage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const readAdminSession = (storage: Storage, now = Date.now()): AdminSession | null => {
  const serialized = storage.getItem(SESSION_KEY);
  if (!serialized) return null;

  try {
    const value = JSON.parse(serialized) as Partial<AdminSession>;
    if (
      typeof value.token !== 'string' ||
      typeof value.expiresAt !== 'string' ||
      Date.parse(value.expiresAt) <= now
    ) {
      clearAdminSession(storage);
      return null;
    }
    return { token: value.token, expiresAt: value.expiresAt };
  } catch {
    clearAdminSession(storage);
    return null;
  }
};

export const getBrowserAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return readAdminSession(window.sessionStorage)?.token ?? null;
};

export const invalidateBrowserAdminSession = (): void => {
  if (typeof window === 'undefined') return;
  clearAdminSession(window.sessionStorage);
  window.dispatchEvent(new Event(ADMIN_SESSION_INVALIDATED_EVENT));
};

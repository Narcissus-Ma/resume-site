import { type ReactNode, useEffect, useState } from 'react';

import { Spin } from 'antd';

import { useNavigate } from 'react-router-dom';

import { useAdminAuth } from '@/auth/admin-auth-context';

interface AdminRouteGuardProps {
  children: ReactNode;
  cancelTo: string;
}

const AdminRouteGuard = ({ children, cancelTo }: AdminRouteGuardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, requestLogin } = useAdminAuth();
  const [authorized, setAuthorized] = useState(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setAuthorized(true);
      return;
    }
    setAuthorized(false);
    void requestLogin().then((success) => {
      if (success) setAuthorized(true);
      else navigate(cancelTo, { replace: true });
    });
  }, [cancelTo, isAuthenticated, navigate, requestLogin]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  return children;
};

export default AdminRouteGuard;

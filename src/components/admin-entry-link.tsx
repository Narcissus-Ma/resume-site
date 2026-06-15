import type { MouseEvent, ReactNode } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAdminAuth } from '@/auth/admin-auth-context';

interface AdminEntryLinkProps {
  children: ReactNode;
  to: string;
}

const AdminEntryLink = ({ children, to }: AdminEntryLinkProps) => {
  const navigate = useNavigate();
  const { requestLogin } = useAdminAuth();

  const handleClick = async (event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    if (await requestLogin()) navigate(to);
  };

  return (
    <span role="link" tabIndex={0} onClick={(event) => void handleClick(event)}>
      {children}
    </span>
  );
};

export default AdminEntryLink;

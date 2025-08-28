import { createBrowserRouter } from 'react-router-dom';
import Home from '@/pages/home/home';
import Resume from '@/pages/resume/resume';
import NotFound from '@/pages/error-page/not-found';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
      errorElement: <NotFound />,
    },
    {
      path: '/resume',
      element: <Resume />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
  {
    basename: '/resume-site',
  }
);

export default router;
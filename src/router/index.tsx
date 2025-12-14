import { createBrowserRouter } from "react-router-dom";

import NotFound from "@/pages/error-page/not-found";
import Home from "@/pages/home/home";
import Resume from "@/pages/resume/resume";
import ResumeEditor from "@/pages/resume/resume-editor";

// 动态设置basename，以适应不同部署环境
const getBasename = () => {
  // 检查当前URL路径
  const pathname = window.location.pathname;

  // 检查URL是否包含'/resume-site/'
  if (pathname.includes("/resume-site/")) {
    return "/resume-site/";
  }

  // 如果不包含'/resume-site/'，则使用空字符串
  // 这将适用于直接部署在域名根目录的情况（如Cloudflare）
  return "";
};

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Home />,
      errorElement: <NotFound />,
    },
    {
      path: "/resume",
      element: <Resume />,
    },
    {
      path: "/resume-editor",
      element: <ResumeEditor />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    basename: getBasename(),
  }
);

export default router;

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Header from "@/components/resume-header";

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header showExportButton={false} />
      <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-9xl font-bold text-gray-300 mb-6">404</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t("notFound.title")}</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t("notFound.description")}
          </p>
          <button
            onClick={handleGoHome}
            className="bg-primary text-white font-medium py-2 px-6 rounded-md hover:bg-primary/90 transition duration-200"
          >
            {t("notFound.backToHome")}
          </button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;

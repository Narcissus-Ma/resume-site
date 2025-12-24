import React from 'react';

import { useTranslation } from 'react-i18next';

interface SkillDescriptionProps {
  skillDescriptions: string[];
}

const SkillDescription: React.FC<SkillDescriptionProps> = ({ skillDescriptions }) => {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{t("skills.descriptionTitle")}</h2>
      <div className="space-y-2">
        {skillDescriptions.map((skillDescription, index) => (
          <p key={index} className="flex items-start">
            <span className="mr-2">{index + 1}.</span>
            <span>{skillDescription}</span>
          </p>
        ))}
      </div>
    </section>
  );
};

export default SkillDescription;
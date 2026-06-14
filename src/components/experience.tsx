import React from 'react';

import { useTranslation } from 'react-i18next';

import { Experience as ExperienceType, Project, Education, Website } from '../types/resume';

interface ExperienceProps {
  experience: ExperienceType[];
  projects: Project[];
  education: Education[];
  website: Website[];
}

const Experience: React.FC<ExperienceProps> = ({ experience, projects, education, website }) => {
  const { t } = useTranslation();
  return (
    <>
      <section className="theme-surface mb-6 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{t('resume.projects')}</h2>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.name} className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-semibold">{project.name}</h3>
              <p className="theme-text-muted">{project.period}</p>
              <p className="theme-text-secondary mt-2">{project.description}</p>
              <ul className="theme-text-secondary mt-2 list-inside list-disc space-y-1">
                {project.responsibilities?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="theme-surface mb-6 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{t('resume.experience')}</h2>
        <div className="space-y-6">
          {experience.map((exp) => (
            <div key={exp.company} className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-semibold">{exp.company}</h3>
              <p className="theme-text-muted">
                {exp.position} | {exp.period}
              </p>
              <ul className="theme-text-secondary mt-2 list-inside list-disc space-y-1">
                {exp.achievements?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="theme-surface mb-6 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{t('resume.education')}</h2>
        {education.map((edu) => (
          <div key={edu.school}>
            <h3 className="text-xl font-semibold">{edu.school}</h3>
            <p className="theme-text-muted">
              {edu.degree} | {edu.period}
            </p>
            <ul className="theme-text-secondary mt-2 list-inside list-disc space-y-1">
              {edu.achievements?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="theme-surface mb-6 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{t('resume.websites')}</h2>
        <div className="flex flex-wrap gap-4">
          {website.map((site) => (
            <a
              key={site.name}
              className="rounded-lg bg-[var(--color-surface-muted)] px-4 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
              href={site.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {site.name}
            </a>
          ))}
        </div>
      </section>
    </>
  );
};

export default Experience;

import { validateHomeCatalog } from '@/domain/home/rules/home-catalog';
import { validateResumeCatalog } from '@/domain/resume/rules/resume-catalog';
import type { HomeCatalog, HomeProfile } from '@/types';
import type { ResumeCatalog, ResumeProfile } from '@/types/resume';

interface PublicProfileResponse {
  revision: number;
  profile: unknown;
}

const isPublicResponse = (value: unknown): value is PublicProfileResponse =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Number.isSafeInteger((value as Record<string, unknown>).revision) &&
  (value as Record<string, unknown>).profile !== undefined;

export const resolvePublicHomeProfile = (
  localCatalog: HomeCatalog,
  remote: unknown,
): HomeProfile => {
  const fallback = localCatalog.homes.find((home) => home.id === localCatalog.activeHomeId)!;
  if (!isPublicResponse(remote)) return fallback;

  try {
    const catalog: HomeCatalog = {
      schemaVersion: 1,
      activeHomeId: (remote.profile as HomeProfile).id,
      homes: [remote.profile as HomeProfile],
    };
    validateHomeCatalog(catalog);
    return catalog.homes[0];
  } catch {
    return fallback;
  }
};

export const resolvePublicResumeProfile = (
  localCatalog: ResumeCatalog,
  remote: unknown,
): ResumeProfile => {
  const fallback = localCatalog.resumes.find(
    (resume) => resume.id === localCatalog.activeResumeId,
  )!;
  if (!isPublicResponse(remote)) return fallback;

  try {
    const catalog: ResumeCatalog = {
      schemaVersion: 1,
      activeResumeId: (remote.profile as ResumeProfile).id,
      resumes: [remote.profile as ResumeProfile],
    };
    validateResumeCatalog(catalog);
    return catalog.resumes[0];
  } catch {
    return fallback;
  }
};

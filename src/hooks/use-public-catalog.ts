import { useEffect, useState } from 'react';

import {
  resolvePublicHomeProfile,
  resolvePublicResumeProfile,
} from '@/domain/catalog/public-catalog';
import { publicCatalogApi } from '@/services/public-catalog-api';
import type { HomeCatalog, HomeProfile } from '@/types';
import type { ResumeCatalog, ResumeProfile } from '@/types/resume';

export const usePublicHomeProfile = (localCatalog: HomeCatalog): HomeProfile => {
  const [profile, setProfile] = useState(() => resolvePublicHomeProfile(localCatalog, null));

  useEffect(() => {
    let active = true;
    void publicCatalogApi.getHome().then((remote) => {
      if (active) setProfile(resolvePublicHomeProfile(localCatalog, remote));
    });
    return () => {
      active = false;
    };
  }, [localCatalog]);

  return profile;
};

export const usePublicResumeProfile = (localCatalog: ResumeCatalog): ResumeProfile => {
  const [profile, setProfile] = useState(() => resolvePublicResumeProfile(localCatalog, null));

  useEffect(() => {
    let active = true;
    void publicCatalogApi.getResume().then((remote) => {
      if (active) setProfile(resolvePublicResumeProfile(localCatalog, remote));
    });
    return () => {
      active = false;
    };
  }, [localCatalog]);

  return profile;
};

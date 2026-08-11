import { useEffect, useState } from 'react';

import {
  resolvePublicHomeProfile,
  resolvePublicResumeProfile,
} from '@/domain/catalog/public-catalog';
import { publicCatalogApi } from '@/services/public-catalog-api';
import type { HomeCatalog, HomeProfile } from '@/types';
import type { ResumeCatalog, ResumeProfile } from '@/types/resume';

interface PublicResumeProfileState {
  loading: boolean;
  profile: ResumeProfile;
}

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

export const usePublicResumeProfile = (localCatalog: ResumeCatalog): PublicResumeProfileState => {
  const [profile, setProfile] = useState(() => resolvePublicResumeProfile(localCatalog, null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void publicCatalogApi.getResume().then((remote) => {
      if (active) {
        setProfile(resolvePublicResumeProfile(localCatalog, remote));
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [localCatalog]);

  return { loading, profile };
};

import { useEffect, useState } from 'react';

import {
  resolvePublicHomeProfile,
  resolvePublicResumeProfile,
} from '@/domain/catalog/public-catalog';
import { publicCatalogApi } from '@/services/public-catalog-api';
import type { HomeCatalog, HomeProfile } from '@/types';
import type { ResumeCatalog, ResumeProfile } from '@/types/resume';

interface PublicProfileState<T> {
  loading: boolean;
  profile: T;
}

export const usePublicHomeProfile = (
  localCatalog: HomeCatalog,
): PublicProfileState<HomeProfile> => {
  const [profile, setProfile] = useState(() => resolvePublicHomeProfile(localCatalog, null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void publicCatalogApi.getHome().then((remote) => {
      if (active) {
        setProfile(resolvePublicHomeProfile(localCatalog, remote));
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [localCatalog]);

  return { loading, profile };
};

export const usePublicResumeProfile = (
  localCatalog: ResumeCatalog,
): PublicProfileState<ResumeProfile> => {
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

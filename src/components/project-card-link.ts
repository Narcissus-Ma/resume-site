const PROJECT_LINK_BASE_URL = 'https://resume-site.local';
const ALLOWED_PROJECT_PROTOCOLS = new Set(['http:', 'https:']);

export const getProjectCardHref = (link: string): string | null => {
  const normalizedLink = link.trim();

  if (!normalizedLink || normalizedLink === '#') {
    return null;
  }

  try {
    const url = new URL(normalizedLink, PROJECT_LINK_BASE_URL);

    return ALLOWED_PROJECT_PROTOCOLS.has(url.protocol) ? normalizedLink : null;
  } catch {
    return null;
  }
};

const DEFAULT_DEV_BACKEND_PORT = '5179';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function buildLocalDevBackendUrl(): string {
  if (typeof window === 'undefined') {
    return `http://localhost:${DEFAULT_DEV_BACKEND_PORT}`;
  }

  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:${DEFAULT_DEV_BACKEND_PORT}`;
}

export function getBackendBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  if (import.meta.env.DEV) {
    const fallbackUrl = buildLocalDevBackendUrl();
    console.debug(`[OneSake] Using development backend URL: ${fallbackUrl}`);
    return fallbackUrl;
  }

  throw new Error(
    'VITE_BACKEND_URL is not configured. Set it to the deployed backend origin before building the frontend.',
  );
}

export function getMatchHubUrl(): string {
  return `${getBackendBaseUrl()}/matchHub`;
}

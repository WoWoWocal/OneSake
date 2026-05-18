const DEFAULT_DEV_BACKEND_PORT = '5179';

function normalizeBaseUrl(url: string): string {
  return url
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/matchHub$/i, '');
}

function buildLocalDevBackendUrl(): string {
  if (typeof window === 'undefined') {
    return `http://localhost:${DEFAULT_DEV_BACKEND_PORT}`;
  }

  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:${DEFAULT_DEV_BACKEND_PORT}`;
}

function isLoopbackHost(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname.toLowerCase());
}

function getReachableDevHostUrl(configuredUrl: string): string {
  if (typeof window === 'undefined') {
    return configuredUrl;
  }

  const browserHostname = window.location.hostname;
  if (!browserHostname || isLoopbackHost(browserHostname)) {
    return configuredUrl;
  }

  try {
    const parsedUrl = new URL(configuredUrl);
    if (!isLoopbackHost(parsedUrl.hostname)) {
      return configuredUrl;
    }

    parsedUrl.hostname = browserHostname;
    return normalizeBaseUrl(parsedUrl.toString());
  } catch {
    return configuredUrl;
  }
}

export function getBackendBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (configuredUrl) {
    const normalizedUrl = normalizeBaseUrl(configuredUrl);
    const reachableUrl = import.meta.env.DEV ? getReachableDevHostUrl(normalizedUrl) : normalizedUrl;

    if (import.meta.env.DEV && reachableUrl !== normalizedUrl) {
      console.debug(`[OneSake] Rewriting local backend URL for this device: ${reachableUrl}`);
    }

    return reachableUrl;
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
  const matchHubUrl = `${getBackendBaseUrl()}/matchHub`;

  if (import.meta.env.DEV) {
    console.debug(`[OneSake] Using match hub URL: ${matchHubUrl}`);
  }

  return matchHubUrl;
}

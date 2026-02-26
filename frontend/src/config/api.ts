/**
 * API base URL. In dev with Vite proxy, use '' so /api requests go to the proxy.
 * In production, set VITE_API_URL to the backend origin if frontend is on a different host.
 */
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export function apiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base + p;
}

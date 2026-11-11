import { requestJson, apiErrorMessage } from './http';

function readClientToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const match = document.cookie.match(/(^| )auth_token=([^;]+)/);
  return match ? match[2] : undefined;
}

/**
 * Fetch data from backend with auth token
 * Use this ONLY in Client Components ('use client')
 */
export async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const { res, data } = await requestJson(endpoint, options, readClientToken());

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('user');
      window.location.href = '/login';
      return { data: [] }; // Prevent React crash during redirect
    }
    throw new Error(apiErrorMessage(data));
  }

  return data;
}

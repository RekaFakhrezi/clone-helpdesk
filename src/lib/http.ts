export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const DEFAULT_ERROR = 'Terjadi kesalahan saat memanggil API';

function buildHeaders(token?: string, extra?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Panggil backend lalu baca body JSON-nya.
 * Pemanggil yang menentukan bagaimana status non-2xx ditangani.
 */
export async function requestJson(endpoint: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(token, options.headers),
  });

  const data = await res.json();

  return { res, data };
}

export function apiErrorMessage(data: unknown): string {
  const body = data as { message?: string; error?: string } | null | undefined;
  return body?.message || body?.error || DEFAULT_ERROR;
}

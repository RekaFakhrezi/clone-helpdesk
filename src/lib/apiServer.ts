import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requestJson, apiErrorMessage } from './http';

/**
 * Fetch data from backend with auth token
 * Use this ONLY in Server Components
 */
export async function fetchServer(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const { res, data } = await requestJson(endpoint, { ...options, cache: 'no-store' }, token);

  if (!res.ok) {
    if (res.status === 401) {
      redirect('/logout');
    }
    throw new Error(apiErrorMessage(data));
  }

  return data;
}

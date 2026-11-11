import { requestJson } from './http';

export interface LoginAuthUser {
  id?: string;
  email?: string;
  role?: string;
  user_metadata?: { role?: string };
  [key: string]: unknown;
}

export interface LoginResult {
  user?: LoginAuthUser;
  profile?: Record<string, unknown>;
  session?: { access_token?: string };
}

export const loginUser = async (email: string, password: string): Promise<LoginResult | undefined> => {
  try {
    const { res, data } = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = data as { error?: string } | null;
      throw new Error(body?.error || 'Login gagal');
    }

    return (data as { data?: LoginResult } | null)?.data;
  } catch (error) {
    console.error('Error in loginUser:', error instanceof Error ? error.message : error);
    throw error;
  }
};

export const logoutUser = async () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
  document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

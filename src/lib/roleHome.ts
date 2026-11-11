const ROLE_HOME: Record<string, string> = {
  admin: '/dashboard/administrasi',
  administrasi: '/dashboard/administrasi',
  pimpinan: '/dashboard/pimpinan',
  operator: '/dashboard/operator',
};

export const DEFAULT_ROLE_HOME = '/dashboard/operator';

/** Path dashboard utama untuk sebuah role. */
export function roleHome(role?: string | null): string {
  return (role && ROLE_HOME[role]) || DEFAULT_ROLE_HOME;
}

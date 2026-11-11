import { NextResponse, type NextRequest } from 'next/server';
import { roleHome } from '@/lib/roleHome';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Periksa cookie isLoggedIn yang di set oleh halaman login
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const userRole = request.cookies.get('userRole')?.value || '';

  // A. Jika user MENCOBA mengakses halaman dashboard tapi BELUM login
  if (url.pathname.startsWith('/dashboard') && !isLoggedIn) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // B. Role-Based Access Control (RBAC) untuk Dashboard
  if (isLoggedIn && url.pathname.startsWith('/dashboard')) {
    // Tangani root /dashboard redirect sesuai role
    if (url.pathname === '/dashboard') {
      url.pathname = roleHome(userRole);
      return NextResponse.redirect(url);
    }

    // Proteksi dashboard admin
    if (url.pathname.startsWith('/dashboard/administrasi') && (userRole !== 'admin' && userRole !== 'administrasi')) {
      url.pathname = '/dashboard/operator';
      return NextResponse.redirect(url);
    }
  }

  // C. Jika user SUDAH login tapi mencoba kembali ke halaman login
  if (url.pathname.startsWith('/login') && isLoggedIn) {
    url.pathname = roleHome(userRole);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login'
  ],
};

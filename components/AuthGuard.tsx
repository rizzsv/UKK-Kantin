'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, UserRole } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function AuthGuard({ children, requiredRole, redirectTo }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();

      console.log('🔒 AuthGuard Check:', {
        pathname,
        requiredRole,
        currentUser: user,
      });

      // If no user and role is required, redirect to appropriate login
      if (!user && requiredRole) {
        console.log('❌ No user found, redirecting to login');
        if (requiredRole === 'admin') {
          router.replace('/admin/login');
        } else {
          router.replace('/login');
        }
        setIsChecking(false);
        return;
      }

      // If user exists but wrong role, redirect with alert
      if (user && requiredRole && user.role !== requiredRole) {
        console.log('❌ Wrong role, redirecting');
        if (requiredRole === 'admin' && user.role === 'student') {
          alert('Akses ditolak! Anda tidak memiliki izin untuk mengakses halaman admin.');
          router.replace('/');
        } else if (requiredRole === 'student' && user.role === 'admin') {
          alert('Akses ditolak! Silakan logout dari admin terlebih dahulu.');
          router.replace('/admin/dashboard');
        }
        setIsChecking(false);
        return;
      }

      // If custom redirect specified and no user
      if (redirectTo && !user) {
        console.log('❌ No user, custom redirect');
        router.replace(redirectTo);
        setIsChecking(false);
        return;
      }

      // All checks passed
      console.log('✅ Auth check passed');
      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, requiredRole, redirectTo, router]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}

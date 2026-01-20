// Authentication utilities and guards

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  username: string;
  role: UserRole;
  token: string;
}

// Get current user from localStorage
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  const studentToken = localStorage.getItem('authToken');
  const adminToken = localStorage.getItem('adminAuthToken');
  const studentLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  if (adminLoggedIn && adminToken) {
    return {
      username: localStorage.getItem('adminUsername') || '',
      role: 'admin',
      token: adminToken,
    };
  }

  if (studentLoggedIn && studentToken) {
    return {
      username: localStorage.getItem('username') || '',
      role: 'student',
      token: studentToken,
    };
  }

  return null;
}

// Check if user is logged in
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Check if user is admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

// Check if user is student
export function isStudent(): boolean {
  const user = getCurrentUser();
  return user?.role === 'student';
}

// Logout user
export function logout(role?: UserRole) {
  if (role === 'admin' || !role) {
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('stallData');
  }

  if (role === 'student' || !role) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userData');
    localStorage.removeItem('cart');
  }
}

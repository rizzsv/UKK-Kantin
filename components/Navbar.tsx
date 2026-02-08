'use client';

import Link from 'next/link';
import { User, UtensilsCrossed, ChevronDown, UserCircle, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getCurrentUser, logout } from '@/lib/auth';

export function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const userLoggedIn = localStorage.getItem('isLoggedIn');
      const adminLoggedIn = localStorage.getItem('isAdminLoggedIn');
      const userUsername = localStorage.getItem('username');
      const adminUsername = localStorage.getItem('adminUsername');

      if (userLoggedIn === 'true') {
        setIsLoggedIn(true);
        setUsername(userUsername || 'User');
      } else if (adminLoggedIn === 'true') {
        setIsLoggedIn(true);
        setUsername(adminUsername || 'Admin');
      } else {
        setIsLoggedIn(false);
        setUsername('');
      }
    };

    checkLoginStatus();

    // Listen for storage changes (for cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn' || e.key === 'username' || e.key === 'userData') {
        checkLoginStatus();
      }
    };

    // Listen for custom storage event (for same-tab updates)
    const handleCustomStorageEvent = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleCustomStorageEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorageEvent);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="transform group-hover:scale-110 transition-transform duration-300">
              <img src="/logo.png" alt="CanteenHub Logo" className="w-12 h-12 rounded-xl shadow-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                CanteenHub
              </h1>
              <p className="text-xs text-gray-500 font-medium">Order with Ease</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              Menu
            </Link>
            <Link
              href="/discounts"
              className="text-gray-700 hover:text-white hover:bg-orange-600 px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1"
            >
              <span>🏷️</span> Promo
            </Link>
            <Link
              href="/orders"
              className="text-gray-700 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              My Orders
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              About
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* User Profile with Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-3 hover:bg-blue-600 rounded-full transition-colors duration-200 group"
              >
                <User className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
                <ChevronDown className={`w-4 h-4 text-gray-700 group-hover:text-white transition-all duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-fade-in-down">
                  {isLoggedIn ? (
                    <>
                      {/* Logged In Menu */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-700">Hello, {username}! 👋</p>
                      </div>

                      <Link
                        href={localStorage.getItem('isAdminLoggedIn') === 'true' ? '/admin/dashboard' : '/profile'}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-800">Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          const user = getCurrentUser();
                          logout(user?.role);
                          window.location.href = '/';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                      >
                        <Shield className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-600">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Not Logged In Menu */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-700">Choose Login Role</p>
                      </div>

                      {/* Student/User Login */}
                      <Link
                        href="/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <UserCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Student / User</p>
                          <p className="text-xs text-gray-500">Login to order</p>
                        </div>
                      </Link>

                      {/* Admin Login */}
                      <Link
                        href="/admin/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Stall Admin</p>
                          <p className="text-xs text-gray-500">Manage stall & menu</p>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

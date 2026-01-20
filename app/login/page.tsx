'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/Button';
import { getCurrentUser } from '@/lib/auth';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'student') {
        router.replace('/');
      } else if (user.role === 'admin') {
        alert('Anda sudah login sebagai admin. Silakan logout terlebih dahulu.');
        router.replace('/admin/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.loginStudent(formData);
      
      console.log('📦 Login Response:', response);
      
      // Extract student data from response (from cookies/session)
      const siswaData = response?.siswa || response?.student || response?.data;
      
      // Store login credentials/data with student info
      const userData = {
        username: formData.username,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
        // Map student data to correct fields
        nama_siswa: siswaData?.nama_siswa || siswaData?.name || formData.username,
        alamat: siswaData?.alamat || siswaData?.address || '',
        telp: siswaData?.telp || siswaData?.phone || '',
        foto: siswaData?.foto || siswaData?.photo || '',
        id: siswaData?.id || null,
      };
      
      // Store all data synchronously
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', formData.username);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Store access_token from API response
      const accessToken = response?.access_token || response?.token;
      if (accessToken) {
        apiClient.setToken(accessToken);
        localStorage.setItem('authToken', accessToken);
        console.log('✅ Token saved:', accessToken.substring(0, 20) + '...');
      } else {
        console.log('⚠️ No token in response. Full response:', response);
      }

      console.log('✅ User data saved:', userData);

      // Show success message
      alert('Login berhasil!');
      
      // Wait a bit to ensure localStorage is written before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Trigger storage event manually for same-tab updates
      window.dispatchEvent(new Event('storage'));
      
      // Redirect to homepage
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Back!</span>
          </h1>
          <p className="text-gray-600">Sign in to continue ordering</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in-down">
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-900"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">
                Register Now
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Make sure you've registered first before trying to login
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/Button';
import { Store, User, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Show success message if just registered
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.loginStall({
        username: formData.username,
        password: formData.password,
      });

      console.log('Stall login response:', response);

      // Extract access token from response
      const accessToken = response?.access_token || response?.token;
      
      if (accessToken) {
        // Set token to API client
        apiClient.setToken(accessToken);
        
        // Store in localStorage
        localStorage.setItem('adminAuthToken', accessToken);
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUsername', formData.username);
        
        // Store stall data from response (from cookie/session)
        if (response.stan || response.stall) {
          const stallData = response.stan || response.stall;
          localStorage.setItem('stallData', JSON.stringify({
            id: stallData.id,
            stan_name: stallData.stan_name || stallData.nama_stan,
            owner_name: stallData.owner_name || stallData.pemilik,
            phone: stallData.phone || stallData.telp,
            username: formData.username,
          }));
        }
        
        console.log('✅ Admin login successful, token stored');
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        throw new Error('Token tidak ditemukan dalam respons');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center px-4 py-12">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in-down">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-semibold">Registrasi Berhasil!</p>
              <p className="text-green-700 text-sm">Silakan login dengan akun Anda</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Admin Stan</h1>
          <p className="text-gray-600">Masuk untuk mengelola stan Anda</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="Masukkan username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full !text-black"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Login
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Belum punya akun?{' '}
              <Link href="/admin/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { menuApiClient } from '@/lib/menu-api';
import { Button } from '@/components/Button';
import { getCurrentUser } from '@/lib/auth';
import { SuccessNotification } from '@/components/SuccessNotification';
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
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (user.role === 'student') {
        alert('You are already logged in as a student. Please logout first.');
        router.replace('/');
      }
      return;
    }

    // Show success message if just registered
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams, router]);

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
      setError('Username and password are required');
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
        // Set token to API clients
        apiClient.setToken(accessToken);
        menuApiClient.setToken(accessToken); // Set to menu API client too
        
        // Store in localStorage
        localStorage.setItem('adminAuthToken', accessToken);
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUsername', formData.username);
        
        // Fetch stall profile using the token
        try {
          console.log('🔄 Fetching stall profile after login...');
          const profileResponse = await fetch('/api/profilstan', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'makerID': '1',
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('📦 Stall profile fetched:', profileData);
            
            // Handle multiple possible response structures
            let stallInfo = profileData.data || profileData.stan || profileData.stall || profileData;
            
            // If stallInfo is an array, take the first element
            if (Array.isArray(stallInfo)) {
              stallInfo = stallInfo[0] || {};
            }
            
            const savedData = {
              id: stallInfo.id || stallInfo.id_stan || 0,
              stan_name: stallInfo.stan_name || stallInfo.nama_stan || stallInfo.name || '',
              owner_name: stallInfo.owner_name || stallInfo.pemilik || stallInfo.owner || '',
              phone: stallInfo.phone || stallInfo.telp || stallInfo.no_telp || '',
              username: stallInfo.username || formData.username,
            };
            
            console.log('💾 Saving stall data to localStorage:', savedData);
            localStorage.setItem('stallData', JSON.stringify(savedData));
          } else {
            console.warn('⚠️ Failed to fetch stall profile, saving minimal info');
            localStorage.setItem('stallData', JSON.stringify({
              id: 0,
              stan_name: '',
              owner_name: '',
              phone: '',
              username: formData.username,
            }));
          }
        } catch (profileError) {
          console.error('❌ Error fetching stall profile:', profileError);
          // Save minimal info on error
          localStorage.setItem('stallData', JSON.stringify({
            id: 0,
            stan_name: '',
            owner_name: '',
            phone: '',
            username: formData.username,
          }));
        }
        
        console.log('✅ Admin login successful, token stored');
        
        // Show success notification
        setShowLoginSuccess(true);
        
        // Redirect to admin dashboard after showing notification
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        throw new Error('Token not found in response');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessNotification
        show={showLoginSuccess}
        message="Selamat datang Admin! Login berhasil."
        onClose={() => setShowLoginSuccess(false)}
      />
      
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
              <p className="text-green-800 font-semibold">Registration Successful!</p>
              <p className="text-green-700 text-sm">Please login with your account</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="CanteenHub Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stall Admin Login</h1>
          <p className="text-gray-600">Sign in to manage your stall</p>
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
                  placeholder="Enter username"
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
                  placeholder="Enter password"
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
                  Processing...
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
              Don't have an account?{' '}
              <Link href="/admin/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}

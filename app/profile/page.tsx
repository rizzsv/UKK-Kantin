'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { AuthGuard } from '@/components/AuthGuard';
import { User, Phone, MapPin, Camera, Save, LogOut, Package, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    nama_siswa: '',
    username: '',
    telp: '',
    alamat: '',
    foto: '',
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    const loadUserData = async () => {
      // Check if user is logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const token = localStorage.getItem('authToken');
      
      if (!isLoggedIn || !token) {
        // Redirect to login if not logged in
        router.push('/login');
        return;
      }

      try {
        // Set token for API client
        apiClient.setToken(token);
        
        // Fetch profile from API
        const profileData = await apiClient.getUserProfile();
        console.log('📦 Profile - API Response:', profileData);
        
        // Handle both English and Indonesian field names from API
        setProfile({
          nama_siswa: profileData.student_name || profileData.nama_siswa || 'User',
          username: profileData.username || '',
          telp: profileData.phone || profileData.telp || '',
          alamat: profileData.address || profileData.alamat || '',
          foto: profileData.photo || profileData.foto || '',
        });
        
        // Update localStorage with fresh data
        localStorage.setItem('userData', JSON.stringify({
          nama_siswa: profileData.student_name || profileData.nama_siswa,
          username: profileData.username,
          telp: profileData.phone || profileData.telp,
          alamat: profileData.address || profileData.alamat,
          foto: profileData.photo || profileData.foto,
          phone: profileData.phone || profileData.telp,
          address: profileData.address || profileData.alamat,
          photo: profileData.photo || profileData.foto,
          id: profileData.id,
          user_id: profileData.user_id,
          maker_id: profileData.maker_id,
          role: profileData.role,
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Fallback to localStorage if API fails
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            setProfile({
              nama_siswa: parsed.nama_siswa || parsed.student_name || 'User',
              username: parsed.username || '',
              telp: parsed.telp || parsed.phone || '',
              alamat: parsed.alamat || parsed.address || '',
              foto: parsed.foto || parsed.photo || '',
            });
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
      }

      // Load order statistics (mock data for now, will be replaced with API call)
      const orders = localStorage.getItem('userOrders');
      if (orders) {
        try {
          const parsed = JSON.parse(orders);
          setOrderStats({
            total: parsed.length || 0,
            completed: parsed.filter((o: any) => o.status === 'selesai').length || 0,
            pending: parsed.filter((o: any) => o.status === 'dikemas' || o.status === 'dikirim').length || 0,
          });
        } catch (err) {
          console.error('Error parsing orders:', err);
        }
      }
      
      setLoading(false);
    };

    // Initial load
    loadUserData();
    
    // Listen for storage events to update profile when data changes
    const handleStorageChange = () => {
      console.log('📦 Profile - Storage changed, reloading...');
      loadUserData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('registeredUser');
    
    alert('Logout berhasil!');
    router.push('/login');
  };

  const handleSave = () => {
    // Update localStorage with new data
    const currentData = localStorage.getItem('userData');
    if (currentData) {
      const parsed = JSON.parse(currentData);
      const updated = { ...parsed, ...profile };
      localStorage.setItem('userData', JSON.stringify(updated));
    }
    
    setIsEditing(false);
    alert('Profile berhasil diperbarui!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="student">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-xl text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 -mt-16 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                  {getImageUrl(profile.foto, false) ? (
                    <Image
                      src={getImageUrl(profile.foto)!}
                      alt={profile.nama_siswa}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">{profile.nama_siswa || 'User'}</h2>
                <p className="text-gray-600">@{profile.username || 'username'}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  variant={isEditing ? 'primary' : 'outline'}
                  size="lg"
                  className="min-w-[160px] font-semibold"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Simpan
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleLogout}
                  className="min-w-[160px] font-semibold bg-red-500 hover:bg-red-600 text-white border-none"
                  size="lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.nama_siswa}
                    onChange={(e) => setProfile({ ...profile, nama_siswa: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profile.nama_siswa || '-'}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profile.username || '-'}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.telp}
                    onChange={(e) => setProfile({ ...profile, telp: e.target.value })}
                    placeholder="+62 812 3456 7890"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profile.telp || '-'}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.alamat}
                    onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                    rows={3}
                    placeholder="Enter your address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none text-gray-900"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl min-h-[60px]">{profile.alamat || '-'}</p>
                )}
              </div>
            </div>

            {/* Additional Actions */}
            {isEditing && (
              <div className="mt-8 flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{orderStats.total}</div>
            <p className="text-gray-600 font-medium">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">{orderStats.completed}</div>
            <p className="text-gray-600 font-medium">Completed</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-4xl font-bold text-yellow-600 mb-2">{orderStats.pending}</div>
            <p className="text-gray-600 font-medium">Pending</p>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}

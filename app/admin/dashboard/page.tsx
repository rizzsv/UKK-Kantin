'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { menuApiClient } from '@/lib/menu-api';
import { Button } from '@/components/Button';
import { AuthGuard } from '@/components/AuthGuard';
import { Store, User, Phone, LogOut, Edit2, Save, X, Package, TrendingUp, Users as UsersIcon, ClipboardList, Tag } from 'lucide-react';
import { StudentsManagement } from '@/components/admin/StudentsManagement';
import { MenuManagement } from '@/components/admin/MenuManagement';
import { OrdersManagement } from '@/components/admin/OrdersManagement';
import { DiscountManagement } from '@/components/admin/DiscountManagement';

interface StallData {
  id: number;
  stan_name: string;
  owner_name: string;
  phone: string;
  username: string;
}

type TabType = 'profile' | 'students' | 'menu' | 'orders' | 'discounts';

export default function AdminDashboard() {
  const router = useRouter();
  const [stallData, setStallData] = useState<StallData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [editForm, setEditForm] = useState({
    stan_name: '',
    owner_name: '',
    phone: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const loggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      setIsInitialized(true);
      return;
    }

    // Load token first
    const token = localStorage.getItem('adminAuthToken');
    if (token) {
      apiClient.setToken(token);
      menuApiClient.setToken(token);
      console.log('✅ Admin token loaded to both API clients');
    } else {
      console.warn('⚠️ No admin token found');
      setIsInitialized(true);
      return;
    }

    // Fetch stall profile from API
    const fetchStallProfile = async () => {
      // First, try localStorage as immediate fallback
      const storedStallData = localStorage.getItem('stallData');
      const adminUsername = localStorage.getItem('adminUsername');
      
      // Set default data with username
      const defaultData = {
        id: 0,
        stan_name: '',
        owner_name: '',
        phone: '',
        username: adminUsername || '',
      };
      
      try {
        const response = await fetch('/api/profilstan', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'makerID': '1',
          },
        });

        console.log('📡 Profile API response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('📦 Stall profile from API:', result);
          
          // Handle multiple possible response structures
          let stallInfo = result.data || result.stan || result.stall || result;
          
          // If stallInfo is an array, take the first element
          if (Array.isArray(stallInfo)) {
            stallInfo = stallInfo[0] || {};
          }
          
          console.log('📋 Extracted stallInfo:', stallInfo);
          
          // Extract data with comprehensive field mapping
          const profileData = {
            id: stallInfo.id || stallInfo.id_stan || 0,
            stan_name: stallInfo.stan_name || stallInfo.nama_stan || stallInfo.name || '',
            owner_name: stallInfo.owner_name || stallInfo.pemilik || stallInfo.owner || '',
            phone: stallInfo.phone || stallInfo.telp || stallInfo.no_telp || '',
            username: stallInfo.username || stallInfo.user_name || adminUsername || '',
          };
          
          console.log('✅ Profile data extracted:', profileData);
          
          // Use API data if valid, otherwise use localStorage or default
          if (profileData.id || profileData.stan_name || profileData.owner_name) {
            setStallData(profileData);
            setEditForm({
              stan_name: profileData.stan_name,
              owner_name: profileData.owner_name,
              phone: profileData.phone,
              username: profileData.username,
            });
            localStorage.setItem('stallData', JSON.stringify(profileData));
            return; // Success, exit function
          }
        }
        
        // If we reach here, API didn't return valid data
        throw new Error(`API response not OK or invalid data (status: ${response.status})`);
        
      } catch (error) {
        console.warn('⚠️ Error fetching stall profile:', error);
        console.log('🔄 Using fallback data');
        
        // Try localStorage first
        if (storedStallData) {
          try {
            const data = JSON.parse(storedStallData);
            console.log('📦 Loaded from localStorage:', data);
            setStallData(data);
            setEditForm({
              stan_name: data.stan_name || '',
              owner_name: data.owner_name || '',
              phone: data.phone || '',
              username: data.username || adminUsername || '',
            });
            return;
          } catch (parseError) {
            console.error('❌ Error parsing stored data:', parseError);
          }
        }
        
        // Use default data if all else fails
        console.log('💡 Using default profile data with username');
        setStallData(defaultData);
        setEditForm({
          stan_name: '',
          owner_name: '',
          phone: '',
          username: adminUsername || '',
        });
      } finally {
        // Always set initialized to true
        setIsInitialized(true);
      }
    };

    fetchStallProfile();
  }, []);

  const handleLogout = () => {
    // Clear all admin data
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('stallData');
    apiClient.setToken('');
    menuApiClient.setToken(''); // Clear token from menu API client too
    
    // Redirect to login
    router.push('/admin/login');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - restore original data
      if (stallData) {
        setEditForm({
          stan_name: stallData.stan_name,
          owner_name: stallData.owner_name,
          phone: stallData.phone,
          username: stallData.username,
        });
      }
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!stallData) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.updateStall(stallData.id, {
        stan_name: editForm.stan_name,
        owner_name: editForm.owner_name,
        phone: editForm.phone,
        username: editForm.username,
      });

      // Update local storage
      const updatedData = {
        ...stallData,
        ...editForm,
      };
      setStallData(updatedData);
      localStorage.setItem('stallData', JSON.stringify(updatedData));

      setSuccess('Profil berhasil diperbarui!');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Show welcome page if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          {/* Icon */}
          <div className="mb-8 animate-bounce">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl">
              <Store className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
            Admin Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 animate-fade-in-up animation-delay-200">
            Kelola stan, menu, dan pesanan dengan mudah
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-fade-in-up animation-delay-400">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Store className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Kelola Stan</h3>
              <p className="text-blue-100 text-sm">Atur informasi stan Anda</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Package className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Kelola Menu</h3>
              <p className="text-blue-100 text-sm">Tambah & edit menu makanan</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <UsersIcon className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Kelola Siswa</h3>
              <p className="text-blue-100 text-sm">Manajemen data siswa</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/admin/login')}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Login Admin
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/')}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!stallData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-24 pb-12">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              </div>
              <p className="text-gray-600">Kelola stan, menu, dan siswa</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="!border-red-300 !text-red-600 hover:!bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in-down">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in-down">
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-3 mb-8 overflow-x-auto">
            <Button
              onClick={() => setActiveTab('profile')}
              variant={activeTab === 'profile' ? 'primary' : 'outline'}
              size="sm"
              className={activeTab === 'profile' ? '!text-black font-bold' : 'font-semibold'}
            >
              <Store className="w-4 h-4 mr-2" />
              Profil Stan
            </Button>
            <Button
              onClick={() => setActiveTab('menu')}
              variant={activeTab === 'menu' ? 'primary' : 'outline'}
              size="sm"
              className={activeTab === 'menu' ? '!text-black font-bold' : 'font-semibold'}
            >
              <Package className="w-4 h-4 mr-2" />
              Menu
            </Button>
            <Button
              onClick={() => setActiveTab('students')}
              variant={activeTab === 'students' ? 'primary' : 'outline'}
              size="sm"
              className={activeTab === 'students' ? '!text-black font-bold' : 'font-semibold'}
            >
              <UsersIcon className="w-4 h-4 mr-2" />
              Siswa
            </Button>
            <Button
              onClick={() => setActiveTab('orders')}
              variant={activeTab === 'orders' ? 'primary' : 'outline'}
              size="sm"
              className={activeTab === 'orders' ? '!text-black font-bold' : 'font-semibold'}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Pesanan
            </Button>
            <Button
              onClick={() => setActiveTab('discounts')}
              variant={activeTab === 'discounts' ? 'primary' : 'outline'}
              size="sm"
              className={activeTab === 'discounts' ? '!text-black font-bold' : 'font-semibold'}
            >
              <Tag className="w-4 h-4 mr-2" />
              Diskon
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Total Menu</p>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Pesanan Hari Ini</p>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Total Pelanggan</p>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Profil Stan</h2>
                </div>

                <div className="space-y-6">
                  {/* Username - Read Only */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 font-medium text-lg">{stallData?.username || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <StudentsManagement />
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <MenuManagement />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <OrdersManagement />
            </div>
          )}

          {activeTab === 'discounts' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <DiscountManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

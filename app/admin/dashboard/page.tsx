'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { menuApiClient } from '@/lib/menu-api';
import { Button } from '@/components/Button';
import { Store, User, Phone, LogOut, Edit2, Save, X, Package, TrendingUp, Users as UsersIcon } from 'lucide-react';
import { StudentsManagement } from '@/components/admin/StudentsManagement';
import { MenuManagement } from '@/components/admin/MenuManagement';

interface StallData {
  id: number;
  stan_name: string;
  owner_name: string;
  phone: string;
  username: string;
}

type TabType = 'profile' | 'students' | 'menu';

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

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    // Load stall data from localStorage
    const storedStallData = localStorage.getItem('stallData');
    if (storedStallData) {
      try {
        const data = JSON.parse(storedStallData);
        setStallData(data);
        setEditForm({
          stan_name: data.stan_name || '',
          owner_name: data.owner_name || '',
          phone: data.phone || '',
          username: data.username || '',
        });
      } catch (err) {
        console.error('Error parsing stall data:', err);
      }
    } else {
      // If no stall data, create empty data to prevent infinite loading
      setStallData({
        id: 0,
        stan_name: 'Stan Baru',
        owner_name: '',
        phone: '',
        username: '',
      });
    }

    // Load token
    const token = localStorage.getItem('adminAuthToken');
    if (token) {
      apiClient.setToken(token);
      menuApiClient.setToken(token); // Set token to new menu API client
      console.log('✅ Admin token loaded to both API clients');
    } else {
      console.warn('⚠️ No admin token found');
    }

    setIsInitialized(true);
  }, [router]);

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

  if (!isInitialized || !stallData) {
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
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        onClick={handleEditToggle}
                        variant="outline"
                        size="sm"
                        className="!px-4 !py-2 !text-blue-600 font-semibold"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleSave}
                          variant="primary"
                          size="sm"
                          className="!px-4 !py-2 !text-black font-bold"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Simpan
                        </Button>
                        <Button
                          onClick={handleEditToggle}
                          variant="outline"
                          size="sm"
                          className="!px-4 !py-2 font-semibold"
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Stall Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Stan
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="stan_name"
                          value={editForm.stan_name}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Store className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{stallData.stan_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Pemilik
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="owner_name"
                          value={editForm.owner_name}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{stallData.owner_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      No. Telepon
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{stallData.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="username"
                          value={editForm.username}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{stallData.username}</span>
                      </div>
                    )}
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
        </div>
      </div>
    </div>
  );
}

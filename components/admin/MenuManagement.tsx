'use client';

import { useState, useMemo, useEffect } from 'react';
import { MenuItemNew, menuApiClient } from '@/lib/menu-api';
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu, useMenuDetail } from '@/lib/use-menu';
import { Button } from '@/components/Button';
import { Package, Plus, Edit2, Trash2, X, Save, Search, Image as ImageIcon, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export function MenuManagement() {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItemNew | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'makanan' | 'minuman'>('makanan');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    nama_makanan: '',
    harga: '',
    deskripsi: '',
    jenis: 'makanan' as 'makanan' | 'minuman',
    foto: null as File | null,
  });

  // Load token from localStorage on mount
  useEffect(() => {
    // Try both token keys for compatibility
    const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
    if (token) {
      menuApiClient.setToken(token);
      console.log('✅ Token loaded to menuApiClient:', token.substring(0, 20) + '...');
    } else {
      console.error('❌ No token found in localStorage');
      console.log('Available localStorage keys:', Object.keys(localStorage));
    }
  }, []);

  // React Query Hooks
  const { data: menus = [], isLoading, error, refetch } = useMenus();
  const { data: selectedMenuDetail } = useMenuDetail(selectedMenuId || 0);
  const createMenuMutation = useCreateMenu();
  const updateMenuMutation = useUpdateMenu();
  const deleteMenuMutation = useDeleteMenu();

  // Filtered and Searched Menus
  const filteredMenus = useMemo(() => {
    let filtered = menus;

    // Filter by category
    filtered = filtered.filter((menu) => menu.jenis === activeTab);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (menu) =>
          menu.nama_makanan.toLowerCase().includes(query) ||
          menu.deskripsi.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menus, activeTab, searchQuery]);

  // Show Notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Form Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        foto: e.target.files![0],
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      nama_makanan: '',
      harga: '',
      deskripsi: '',
      jenis: 'makanan',
      foto: null,
    });
    setEditingMenu(null);
  };

  // CRUD Operations
  const handleAdd = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, jenis: activeTab }));
    setShowAddModal(true);
  };

  const handleEdit = (menu: MenuItemNew) => {
    setEditingMenu(menu);
    setFormData({
      nama_makanan: menu.nama_makanan,
      harga: menu.harga.toString(),
      deskripsi: menu.deskripsi,
      jenis: menu.jenis,
      foto: null,
    });
    setShowAddModal(true);
  };

  const handleViewDetail = (menu: MenuItemNew) => {
    setSelectedMenuId(menu.id);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nama_makanan.trim() || !formData.harga || !formData.deskripsi.trim()) {
      showNotification('error', 'Please complete all required fields');
      return;
    }

    const harga = parseFloat(formData.harga);
    if (isNaN(harga) || harga <= 0) {
      showNotification('error', 'Price must be a positive number');
      return;
    }

    try {
      if (editingMenu && editingMenu.id) {
        // Update existing menu - all required fields
        const updateData = {
          nama_makanan: formData.nama_makanan.trim(),
          harga: harga,
          jenis: formData.jenis,
          deskripsi: formData.deskripsi.trim(),
          foto: formData.foto || undefined,
          id_stan: editingMenu.id_stan, // Include existing id_stan
        };
        await updateMenuMutation.mutateAsync({
          id: editingMenu.id,
          data: updateData,
        });
        showNotification('success', 'Menu successfully updated! 🎉');
      } else {
        // Create new menu
        const createData = {
          nama_makanan: formData.nama_makanan.trim(),
          harga: harga,
          jenis: formData.jenis,
          deskripsi: formData.deskripsi.trim(),
          foto: formData.foto || undefined,
        };
        await createMenuMutation.mutateAsync(createData);
        showNotification('success', 'New menu successfully added! 🎉');
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving menu:', error);
      showNotification('error', error instanceof Error ? error.message : 'Failed to save menu');
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Are you sure you want to delete "${nama}"?`)) return;

    try {
      await deleteMenuMutation.mutateAsync(id);
      showNotification('success', 'Menu successfully deleted! 🗑️');
    } catch (error) {
      console.error('Error deleting menu:', error);
      showNotification('error', 'Failed to delete menu');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowDetailModal(false);
    resetForm();
    setSelectedMenuId(null);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Data</h3>
          <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'An error occurred'}</p>
          <Button onClick={() => refetch()} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg animate-slide-in ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
            <p className="text-sm text-gray-600">
              Manage {activeTab} menu easily and quickly
            </p>
          </div>
        </div>
        <Button
          onClick={handleAdd}
          variant="primary"
          className="flex items-center gap-2 !text-white"
        >
          <Plus className="w-5 h-5" />
          Add Menu
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3">
        <Button
          onClick={() => setActiveTab('makanan')}
          variant={activeTab === 'makanan' ? 'primary' : 'outline'}
          size="sm"
          className={activeTab === 'makanan' ? '!text-white' : ''}
        >
          Food ({menus.filter((m) => m.jenis === 'makanan').length})
        </Button>
        <Button
          onClick={() => setActiveTab('minuman')}
          variant={activeTab === 'minuman' ? 'primary' : 'outline'}
          size="sm"
          className={activeTab === 'minuman' ? '!text-white' : ''}
        >
          Beverages ({menus.filter((m) => m.jenis === 'minuman').length})
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
        {searchQuery && (
          <Button onClick={() => setSearchQuery('')} variant="outline">
            Reset
          </Button>
        )}
      </div>

      {/* Menu Grid */}
      {filteredMenus.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeTab} Menu Yet
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'No menu found matching your search'
              : `Add your first ${activeTab} menu`}
          </p>
          {!searchQuery && (
            <Button onClick={handleAdd} variant="primary" className="!text-white">
              <Plus className="w-5 h-5 mr-2" />
              Add Menu
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50">
                {getImageUrl(menu.foto, false) ? (
                  <img
                    src={getImageUrl(menu.foto)!}
                    alt={menu.nama_makanan}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {menu.jenis}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {menu.nama_makanan}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {menu.deskripsi}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xl font-bold text-blue-600">
                    Rp {menu.harga.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleViewDetail(menu)}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    <Info className="w-4 h-4 mr-1" />
                    Detail
                  </Button>
                  <Button
                    onClick={() => handleEdit(menu)}
                    variant="outline"
                    size="sm"
                    className="flex-1 !text-white !bg-blue-600 !border-blue-600 hover:!bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => menu.id && handleDelete(menu.id, menu.nama_makanan)}
                    variant="outline"
                    size="sm"
                    className="flex-1 !text-white !bg-red-600 !border-red-600 hover:!bg-red-700"
                    disabled={deleteMenuMutation.isPending || !menu.id}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingMenu ? 'Edit Menu' : 'Add New Menu'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Menu Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Menu Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_makanan"
                  value={formData.nama_makanan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Example: Special Fried Rice"
                  required
                />
              </div>

              {/* Harga */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Harga <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="15000"
                  min="0"
                  required
                />
              </div>

              {/* Jenis */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenis"
                  value={formData.jenis}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                >
                  <option value="makanan">Food</option>
                  <option value="minuman">Beverages</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                  placeholder="Describe your menu..."
                  required
                />
              </div>

              {/* Foto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Menu Photo {!editingMenu && <span className="text-gray-500">(Optional)</span>}
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.foto && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ File selected: {formData.foto.name}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1"
                  disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 !text-white"
                  disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
                >
                  {createMenuMutation.isPending || updateMenuMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editingMenu ? 'Update' : 'Save'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailModal && selectedMenuDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {getImageUrl(selectedMenuDetail.foto, false) ? (
                <img
                  src={getImageUrl(selectedMenuDetail.foto)!}
                  alt={selectedMenuDetail.nama_makanan}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <ImageIcon className="w-24 h-24 text-gray-400" />
                </div>
              )}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedMenuDetail.nama_makanan}
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {selectedMenuDetail.jenis}
                  </span>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  Rp {selectedMenuDetail.harga.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{selectedMenuDetail.deskripsi}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID Menu</p>
                    <p className="font-semibold text-gray-900">#{selectedMenuDetail.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ID Stan</p>
                    <p className="font-semibold text-gray-900">#{selectedMenuDetail.id_stan}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-semibold text-gray-900">
                      {selectedMenuDetail.created_at ? new Date(selectedMenuDetail.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Updated</p>
                    <p className="font-semibold text-gray-900">
                      {selectedMenuDetail.updated_at ? new Date(selectedMenuDetail.updated_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    closeModal();
                    handleEdit(selectedMenuDetail);
                  }}
                  variant="primary"
                  className="flex-1 !text-white"
                >
                  <Edit2 className="w-5 h-5 mr-2" />
                  Edit Menu
                </Button>
                <Button onClick={closeModal} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

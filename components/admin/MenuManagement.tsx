'use client';

import { useState, useEffect } from 'react';
import { apiClient, MenuItem } from '@/lib/api';
import { Button } from '@/components/Button';
import { Package, Plus, Edit2, Trash2, X, Save, Search, Image as ImageIcon, Info } from 'lucide-react';

export function MenuManagement() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'makanan' | 'minuman'>('makanan');
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    deskripsi: '',
    kategori: 'makanan' as 'makanan' | 'minuman',
    stok: '',
    foto: null as File | null,
  });

  useEffect(() => {
    fetchMenus();
  }, [activeTab]);

  const fetchMenus = async (search: string = '') => {
    setLoading(true);
    try {
      const data = activeTab === 'makanan' 
        ? await apiClient.getFoodMenu(search)
        : await apiClient.getBeverageMenu(search);
      setMenus(data);
    } catch (err) {
      console.error('Error fetching menus:', err);
      setError('Gagal memuat data menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMenus(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        foto: e.target.files[0],
      });
    }
  };

  const handleViewDetail = async (menu: MenuItem) => {
    try {
      const detail = await apiClient.getMenuDetails(menu.id);
      setSelectedMenu(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError('Gagal memuat detail menu');
    }
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setFormData({
      nama: menu.nama,
      harga: menu.harga.toString(),
      deskripsi: menu.deskripsi,
      kategori: menu.kategori,
      stok: menu.stok.toString(),
      foto: null,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return;

    try {
      await apiClient.deleteMenu(id);
      setSuccess('Menu berhasil dihapus');
      fetchMenus(searchQuery);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus menu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const menuData = {
        nama: formData.nama,
        harga: parseInt(formData.harga),
        deskripsi: formData.deskripsi,
        kategori: formData.kategori,
        stok: parseInt(formData.stok),
        foto: formData.foto || undefined,
      };

      if (editingMenu) {
        await apiClient.updateMenu(editingMenu.id, menuData);
        setSuccess('Menu berhasil diperbarui');
      } else {
        await apiClient.addMenu(menuData);
        setSuccess('Menu berhasil ditambahkan');
      }
      
      fetchMenus(searchQuery);
      setShowAddModal(false);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan menu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      harga: '',
      deskripsi: '',
      kategori: 'makanan',
      stok: '',
      foto: null,
    });
    setEditingMenu(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
    setError('');
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Menu</h2>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          className="!text-black"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Menu
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-3">
        <Button
          onClick={() => setActiveTab('makanan')}
          variant={activeTab === 'makanan' ? 'primary' : 'outline'}
          size="sm"
          className={activeTab === 'makanan' ? '!text-black' : ''}
        >
          Makanan
        </Button>
        <Button
          onClick={() => setActiveTab('minuman')}
          variant={activeTab === 'minuman' ? 'primary' : 'outline'}
          size="sm"
          className={activeTab === 'minuman' ? '!text-black' : ''}
        >
          Minuman
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
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cari menu..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        <Button onClick={handleSearch} variant="primary" className="!text-black">
          Cari
        </Button>
      </div>

      {/* Menu List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {menu.foto && (
                <div className="w-full h-48 bg-gray-200">
                  <img
                    src={menu.foto}
                    alt={menu.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{menu.nama}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{menu.deskripsi}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    Rp {menu.harga.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    Stok: {menu.stok}
                  </span>
                </div>
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
                    className="flex-1 !text-blue-600"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(menu.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 !text-red-600 !border-red-300 hover:!bg-red-50"
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

      {menus.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          Tidak ada data menu
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingMenu ? 'Edit Menu' : 'Tambah Menu'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Menu
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="makanan">Makanan</option>
                    <option value="minuman">Minuman</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga
                  </label>
                  <input
                    type="number"
                    name="harga"
                    value={formData.harga}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stok
                  </label>
                  <input
                    type="number"
                    name="stok"
                    value={formData.stok}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Foto (Opsional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.foto ? formData.foto.name : 'Pilih Foto'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 !text-black"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Simpan
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Detail Menu</h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedMenu.foto && (
                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedMenu.foto}
                    alt={selectedMenu.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedMenu.nama}</h4>
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {selectedMenu.kategori}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Harga</p>
                    <p className="text-lg font-bold text-blue-600">
                      Rp {selectedMenu.harga.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stok</p>
                    <p className="text-lg font-bold text-gray-900">{selectedMenu.stok}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Deskripsi</p>
                  <p className="text-gray-900">{selectedMenu.deskripsi}</p>
                </div>
              </div>

              <Button
                onClick={closeDetailModal}
                variant="outline"
                className="w-full"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Plus, Pencil, Trash2, Tag, Percent, Calendar, Search, X, Utensils, Check } from 'lucide-react';

interface MenuDiscount {
  id: number;
  id_menu: number;
  id_diskon: number;
  maker_id: number;
  created_at: string;
  updated_at: string;
  nama_makanan: string;
  harga: number;
  jenis: string;
  foto: string;
  deskripsi: string;
  id_stan: number;
}

interface Discount {
  id: number;
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: string;
  tanggal_akhir: string;
  id_stan: number;
  menu_diskon?: MenuDiscount[];
}

interface MenuItem {
  id: number;
  nama_makanan: string;
  harga: number;
  jenis: string;
  foto: string;
  deskripsi: string;
  id_stan: number;
}

export function DiscountManagement() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [selectedDiscountForMenus, setSelectedDiscountForMenus] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    nama_diskon: '',
    persentase_diskon: '',
    tanggal_awal: '',
    tanggal_akhir: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [addingMenuDiscounts, setAddingMenuDiscounts] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchDiscounts();
  }, [searchQuery]);

  const fetchDiscounts = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      setError('Please login as admin');
      setLoading(false);
      return;
    }

    try {
      // Fetch discounts with menu discounts
      const response = await fetch('/api/getmenudiskon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'makerID': '1',
        },
        body: JSON.stringify({ search: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discounts');
      }

      const data = await response.json();
      console.log('📋 Menu discounts data:', data);

      // Handle response structure
      let discountsArray = [];
      if (data?.data && Array.isArray(data.data)) {
        discountsArray = data.data;
      } else if (Array.isArray(data)) {
        discountsArray = data;
      }

      console.log('✅ Parsed discounts array:', discountsArray);
      setDiscounts(discountsArray);
    } catch (err) {
      console.error('Error fetching discounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    setMenusLoading(true);
    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      setMenusLoading(false);
      return;
    }

    try {
      // Fetch all menus (food and drinks)
      const [foodResponse, drinkResponse] = await Promise.all([
        fetch('/api/getmenufood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'makerID': '1',
          },
          body: JSON.stringify({ search: '' }),
        }),
        fetch('/api/getmenudrink', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'makerID': '1',
          },
          body: JSON.stringify({ search: '' }),
        }),
      ]);

      const foodData = await foodResponse.json();
      const drinkData = await drinkResponse.json();

      const foodMenus = foodData?.data || [];
      const drinkMenus = drinkData?.data || [];

      setMenus([...foodMenus, ...drinkMenus]);
    } catch (err) {
      console.error('Error fetching menus:', err);
    } finally {
      setMenusLoading(false);
    }
  };

  const handleOpenModal = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        nama_diskon: discount.nama_diskon,
        persentase_diskon: discount.persentase_diskon.toString(),
        tanggal_awal: discount.tanggal_awal,
        tanggal_akhir: discount.tanggal_akhir,
      });
    } else {
      setEditingDiscount(null);
      setFormData({
        nama_diskon: '',
        persentase_diskon: '',
        tanggal_awal: '',
        tanggal_akhir: '',
      });
    }
    setShowModal(true);
  };

  const handleOpenMenuModal = async (discount: Discount) => {
    setSelectedDiscountForMenus(discount);
    setShowMenuModal(true);
    await fetchMenus();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDiscount(null);
    setFormData({
      nama_diskon: '',
      persentase_diskon: '',
      tanggal_awal: '',
      tanggal_akhir: '',
    });
  };

  const handleCloseMenuModal = () => {
    setShowMenuModal(false);
    setSelectedDiscountForMenus(null);
    setMenus([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      alert('Please login as admin');
      setSubmitting(false);
      return;
    }

    try {
      const endpoint = editingDiscount
        ? `/api/discount/update/${editingDiscount.id}`
        : '/api/discount/create';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'makerID': '1',
        },
        body: JSON.stringify({
          nama_diskon: formData.nama_diskon,
          persentase_diskon: parseInt(formData.persentase_diskon),
          tanggal_awal: formData.tanggal_awal,
          tanggal_akhir: formData.tanggal_akhir,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save discount');
      }

      const result = await response.json();
      console.log('✅ Discount saved:', result);

      alert(editingDiscount ? 'Discount successfully updated!' : 'Discount successfully added!');
      handleCloseModal();

      setTimeout(() => {
        fetchDiscounts();
      }, 500);
    } catch (err) {
      console.error('Error saving discount:', err);
      alert('Failed to save discount: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMenuToDiscount = async (menuId: number) => {
    if (!selectedDiscountForMenus) return;

    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      alert('Please login as admin');
      return;
    }

    setAddingMenuDiscounts(prev => new Set(prev).add(menuId));

    try {
      const response = await fetch('/api/insert_menu_diskon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'makerID': '1',
        },
        body: JSON.stringify({
          id_diskon: selectedDiscountForMenus.id,
          id_menu: menuId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add menu to discount');
      }

      const result = await response.json();
      console.log('✅ Menu added to discount:', result);

      alert('Menu successfully added to discount!');

      // Refresh discounts and menus
      await fetchDiscounts();
      await fetchMenus();
    } catch (err) {
      console.error('Error adding menu to discount:', err);
      alert('Failed to add menu to discount: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setAddingMenuDiscounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(menuId);
        return newSet;
      });
    }
  };

  const isMenuInDiscount = (menuId: number): boolean => {
    if (!selectedDiscountForMenus?.menu_diskon) return false;
    return selectedDiscountForMenus.menu_diskon.some(md => md.id_menu === menuId);
  };

  const isDiscountActive = (discount: Discount) => {
    const now = new Date();
    const start = new Date(discount.tanggal_awal);
    const end = new Date(discount.tanggal_akhir);
    return now >= start && now <= end;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Discount Management</h2>
        <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Discount
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search discounts..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading discount data...</p>
        </div>
      ) : discounts.length > 0 ? (
        <div className="grid gap-4">
          {discounts.map((discount, index) => {
            const isActive = isDiscountActive(discount);
            const menuCount = discount.menu_diskon?.length || 0;
            return (
              <div
                key={discount.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-800">{discount.nama_diskon}</h3>
                      {isActive ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          Inactive
                        </span>
                      )}
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {menuCount} {menuCount === 1 ? 'menu' : 'menus'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          <strong>{discount.persentase_diskon}%</strong> discount
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                          Start: {new Date(discount.tanggal_awal).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                          Until: {new Date(discount.tanggal_akhir).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Show menus if available */}
                    {discount.menu_diskon && discount.menu_diskon.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Included menus:</p>
                        <div className="flex flex-wrap gap-2">
                          {discount.menu_diskon.map((menu) => (
                            <span
                              key={menu.id}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {menu.nama_makanan}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenMenuModal(discount)}
                      variant="outline"
                      size="sm"
                      title="Manage menus"
                    >
                      <Utensils className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleOpenModal(discount)}
                      variant="outline"
                      size="sm"
                      title="Edit discount"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Discounts Yet</h3>
          <p className="text-gray-500 mb-6">Add your first discount to attract more customers</p>
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Discount
          </Button>
        </div>
      )}

      {/* Add/Edit Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Discount Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Discount Name
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nama_diskon}
                      onChange={(e) => setFormData({ ...formData, nama_diskon: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                      placeholder="Example: New Year Discount"
                      required
                    />
                  </div>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Discount Percentage (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.persentase_diskon}
                      onChange={(e) => setFormData({ ...formData, persentase_diskon: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                      placeholder="10"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Enter a number between 1-100</p>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.tanggal_awal}
                      onChange={(e) => setFormData({ ...formData, tanggal_awal: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.tanggal_akhir}
                      onChange={(e) => setFormData({ ...formData, tanggal_akhir: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingDiscount ? 'Update Discount' : 'Add Discount'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Menu to Discount Modal */}
      {showMenuModal && selectedDiscountForMenus && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Manage Menus</h3>
                    <p className="text-sm text-gray-600">{selectedDiscountForMenus.nama_diskon}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseMenuModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {menusLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading menus...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {menus.map((menu) => {
                    const isInDiscount = isMenuInDiscount(menu.id);
                    const isAdding = addingMenuDiscounts.has(menu.id);

                    return (
                      <div
                        key={menu.id}
                        className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          {menu.foto && (
                            <img
                              src={`https://ukk-p2.smktelkom-mlg.sch.id/${menu.foto}`}
                              alt={menu.nama_makanan}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-bold text-gray-800">{menu.nama_makanan}</h4>
                            <p className="text-sm text-gray-600">
                              {menu.jenis === 'makanan' ? 'Food' : 'Drink'} • Rp {menu.harga.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isInDiscount ? (
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                              <Check className="w-4 h-4" />
                              Added
                            </span>
                          ) : (
                            <Button
                              onClick={() => handleAddMenuToDiscount(menu.id)}
                              disabled={isAdding}
                              variant="primary"
                              size="sm"
                            >
                              {isAdding ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

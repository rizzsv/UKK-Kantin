'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Plus, Pencil, Trash2, Tag, Percent, Calendar, Search, X } from 'lucide-react';

interface Discount {
  id: number;
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: string;
  tanggal_akhir: string;
  id_stan: number;
}

export function DiscountManagement() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    nama_diskon: '',
    persentase_diskon: '',
    tanggal_awal: '',
    tanggal_akhir: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
      const response = await fetch('/api/discount/list', {
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
      console.log('📋 Discounts data:', data);
      console.log('📊 Data structure:', {
        isArray: Array.isArray(data),
        hasData: !!data?.data,
        hasDiskon: !!data?.diskon,
        keys: Object.keys(data),
      });
      
      // Handle multiple possible response structures
      let discountsArray = [];
      if (Array.isArray(data)) {
        discountsArray = data;
      } else if (data?.data) {
        discountsArray = Array.isArray(data.data) ? data.data : [data.data];
      } else if (data?.diskon) {
        discountsArray = Array.isArray(data.diskon) ? data.diskon : [data.diskon];
      }
      
      console.log('✅ Parsed discounts array:', discountsArray);
      console.log('📝 Total discounts:', discountsArray.length);
      
      setDiscounts(discountsArray);
    } catch (err) {
      console.error('Error fetching discounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch discounts');
    } finally {
      setLoading(false);
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

      alert(editingDiscount ? 'Diskon berhasil diupdate!' : 'Diskon berhasil ditambahkan!');
      handleCloseModal();
      
      // Wait a bit before fetching to ensure backend has processed
      setTimeout(() => {
        fetchDiscounts();
      }, 500);
    } catch (err) {
      console.error('Error saving discount:', err);
      alert('Gagal menyimpan diskon: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
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
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Diskon</h2>
        <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Diskon
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari diskon..."
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
          <p className="text-gray-600">Memuat data diskon...</p>
        </div>
      ) : discounts.length > 0 ? (
        <div className="grid gap-4">
          {discounts.map((discount, index) => {
            const isActive = isDiscountActive(discount);
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
                          Aktif
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          Tidak Aktif
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          <strong>{discount.persentase_diskon}%</strong> diskon
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                          Mulai: {new Date(discount.tanggal_awal).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                          Sampai: {new Date(discount.tanggal_akhir).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenModal(discount)}
                      variant="outline"
                      size="sm"
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
          <h3 className="text-xl font-bold text-gray-700 mb-2">Belum Ada Diskon</h3>
          <p className="text-gray-500 mb-6">Tambahkan diskon pertama Anda untuk menarik lebih banyak pelanggan</p>
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Diskon
          </Button>
        </div>
      )}

      {/* Modal */}
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
                    {editingDiscount ? 'Edit Diskon' : 'Tambah Diskon Baru'}
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
                {/* Nama Diskon */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Nama Diskon
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nama_diskon}
                      onChange={(e) => setFormData({ ...formData, nama_diskon: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                      placeholder="Contoh: Diskon Tahun Baru"
                      required
                    />
                  </div>
                </div>

                {/* Persentase Diskon */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Persentase Diskon (%)
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
                  <p className="mt-2 text-xs text-gray-500">Masukkan angka antara 1-100</p>
                </div>

                {/* Tanggal Mulai */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Tanggal Mulai
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

                {/* Tanggal Selesai */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Tanggal Selesai
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
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        {editingDiscount ? 'Update Diskon' : 'Tambah Diskon'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

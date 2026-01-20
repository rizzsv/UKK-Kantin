'use client';

import { useState, useEffect } from 'react';
import { Student, studentApiClient } from '@/lib/student-api';
import { useStudents, useCreateStudent, useDeleteStudent } from '@/lib/use-student';
import { Button } from '@/components/Button';
import { Users, Plus, Trash2, X, Save, Search, CheckCircle, AlertCircle, User } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export function StudentsManagement() {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    student_name: '',
    address: '',
    phone: '',
    username: '',
    password: '',
    photo: null as File | null,
  });

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
    if (token) {
      studentApiClient.setToken(token);
    }
  }, []);

  // React Query Hooks
  const { data: students = [], isLoading, error, refetch } = useStudents();
  const createStudentMutation = useCreateStudent();
  const deleteStudentMutation = useDeleteStudent();

  // Filtered Students
  const filteredStudents = students.filter((student) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.student_name.toLowerCase().includes(query) ||
      student.address.toLowerCase().includes(query) ||
      student.username.toLowerCase().includes(query)
    );
  });

  // Show Notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Form Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        photo: e.target.files![0],
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      student_name: '',
      address: '',
      phone: '',
      username: '',
      password: '',
      photo: null,
    });
  };

  // CRUD Operations
  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.student_name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      showNotification('error', 'Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (!formData.username.trim() || !formData.password.trim()) {
      showNotification('error', 'Username dan password harus diisi');
      return;
    }

    try {
      await createStudentMutation.mutateAsync({
        student_name: formData.student_name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        username: formData.username.trim(),
        password: formData.password,
        photo: formData.photo || undefined,
      });
      showNotification('success', 'Siswa berhasil ditambahkan! 🎉');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      showNotification('error', error instanceof Error ? error.message : 'Gagal menyimpan data siswa');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa "${name}"?`)) return;

    try {
      await deleteStudentMutation.mutateAsync(id);
      showNotification('success', 'Data siswa berhasil dihapus! 🗑️');
    } catch (error) {
      console.error('Error deleting student:', error);
      showNotification('error', 'Gagal menghapus data siswa');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data siswa...</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Terjadi kesalahan'}</p>
          <Button onClick={() => refetch()} variant="primary">
            Coba Lagi
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
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manajemen Siswa</h2>
            <p className="text-sm text-gray-600">
              Kelola data siswa dengan mudah dan cepat
            </p>
          </div>
        </div>
        <Button
          onClick={handleAdd}
          variant="primary"
          className="flex items-center gap-2 !text-black"
        >
          <Plus className="w-5 h-5" />
          Tambah Siswa
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
            placeholder="Cari siswa berdasarkan nama, alamat, atau username..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
        {searchQuery && (
          <Button onClick={() => setSearchQuery('')} variant="outline">
            Reset
          </Button>
        )}
      </div>

      {/* Student List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belum Ada Data Siswa
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'Tidak ditemukan siswa yang sesuai dengan pencarian'
              : 'Tambahkan siswa pertama Anda'}
          </p>
          {!searchQuery && (
            <Button onClick={handleAdd} variant="primary" className="!text-black">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Siswa
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {getImageUrl(student.photo, false) ? (
                          <img
                            src={getImageUrl(student.photo)!}
                            alt={student.student_name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{student.student_name}</p>
                          <p className="text-sm text-gray-600">{student.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{student.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {student.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">User ID: {student.user_id}</p>
                      <p className="text-xs text-gray-500">ID: {student.id}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => handleDelete(student.id, student.student_name)}
                        variant="outline"
                        size="sm"
                        className="!text-red-600 !border-red-300 hover:!bg-red-50"
                        disabled={deleteStudentMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Tambah Siswa Baru</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Nama Siswa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Contoh: Ahmad Rizky"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Contoh: ahmad123"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Masukkan password"
                  required
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Contoh: Jl. Merdeka No. 10"
                  required
                />
              </div>

              {/* No. Telepon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Contoh: 081234567890"
                  required
                />
              </div>

              {/* Foto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Foto Siswa <span className="text-gray-500">(Opsional)</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.photo && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ File dipilih: {formData.photo.name}
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
                  disabled={createStudentMutation.isPending}
                >
                  <X className="w-5 h-5 mr-2" />
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 !text-black"
                  disabled={createStudentMutation.isPending}
                >
                  {createStudentMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

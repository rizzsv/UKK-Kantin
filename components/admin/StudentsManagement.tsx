'use client';

import { useState, useEffect } from 'react';
import { apiClient, Student } from '@/lib/api';
import { Button } from '@/components/Button';
import { Users, Plus, Edit2, Trash2, X, Save, Search, Image as ImageIcon } from 'lucide-react';

export function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    student_name: '',
    address: '',
    phone: '',
    username: '',
    photo: null as File | null,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (search: string = '') => {
    setLoading(true);
    try {
      const data = await apiClient.getAllStudents(search);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStudents(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_name: student.nama_siswa,
      address: student.alamat,
      phone: student.telp,
      username: student.username,
      photo: null,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus siswa ini?')) return;

    try {
      await apiClient.deleteStudent(id);
      setSuccess('Siswa berhasil dihapus');
      fetchStudents(searchQuery);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus siswa');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingStudent) {
        await apiClient.updateStudent(editingStudent.id, {
          student_name: formData.student_name,
          address: formData.address,
          phone: formData.phone,
          username: formData.username,
          photo: formData.photo || undefined,
        });
        setSuccess('Siswa berhasil diperbarui');
      }
      
      fetchStudents(searchQuery);
      setShowAddModal(false);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data siswa');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_name: '',
      address: '',
      phone: '',
      username: '',
      photo: null,
    });
    setEditingStudent(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Siswa</h2>
        </div>
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

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cari siswa..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        <Button onClick={handleSearch} variant="primary">
          Cari
        </Button>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-md p-6 space-y-4">
              {student.foto && (
                <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={student.foto}
                    alt={student.nama_siswa}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{student.nama_siswa}</h3>
                <p className="text-sm text-gray-600">{student.username}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Alamat:</span> {student.alamat}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Telepon:</span> {student.telp}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleEdit(student)}
                  variant="outline"
                  size="sm"
                  className="flex-1 !text-blue-600"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(student.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 !text-red-600 !border-red-300 hover:!bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {students.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          Tidak ada data siswa
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingStudent ? 'Edit Siswa' : 'Tambah Siswa'}
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
                    Nama Siswa
                  </label>
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                        {formData.photo ? formData.photo.name : 'Pilih Foto'}
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
    </div>
  );
}

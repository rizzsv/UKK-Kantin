'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Order } from '@/lib/api';
import { Button } from '@/components/Button';
import { Package, Clock, CheckCircle, Printer, Calendar } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'dikemas' | 'dikirim' | 'selesai'>('all');

  useEffect(() => {
    // Set default month to current month
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthStr);
    
    fetchOrders(monthStr);
  }, []);

  const fetchOrders = async (month: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');
    apiClient.setToken(token);

    try {
      // Fetch orders by month for student
      const data = await apiClient.getOrdersByMonthByStudent(month);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    fetchOrders(newMonth);
  };

  const handlePrintReceipt = async (orderId: number) => {
    try {
      const receipt = await apiClient.printReceipt(orderId);
      // Open print dialog or download PDF
      if (receipt.url) {
        window.open(receipt.url, '_blank');
      } else {
        alert('Nota berhasil dicetak!');
      }
    } catch (err) {
      console.error('Print error:', err);
      alert('Gagal mencetak nota');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dikemas':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'dikirim':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'selesai':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dikemas':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dikirim':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'selesai':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'dikemas':
        return 'Sedang Dikemas';
      case 'dikirim':
        return 'Sedang Dikirim';
      case 'selesai':
        return 'Selesai';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Orders</span>
          </h1>
          <p className="text-xl text-gray-600">Track your order status and history</p>
        </div>

        {/* Month Filter */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <label htmlFor="month" className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Bulan
              </label>
              <input
                type="month"
                id="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => setActiveTab('all')}
            variant={activeTab === 'all' ? 'primary' : 'outline'}
            size="sm"
          >
            Semua ({orders.length})
          </Button>
          <Button
            onClick={() => setActiveTab('dikemas')}
            variant={activeTab === 'dikemas' ? 'primary' : 'outline'}
            size="sm"
          >
            📦 Dikemas ({orders.filter(o => o.status === 'dikemas').length})
          </Button>
          <Button
            onClick={() => setActiveTab('dikirim')}
            variant={activeTab === 'dikirim' ? 'primary' : 'outline'}
            size="sm"
          >
            🚚 Dikirim ({orders.filter(o => o.status === 'dikirim').length})
          </Button>
          <Button
            onClick={() => setActiveTab('selesai')}
            variant={activeTab === 'selesai' ? 'primary' : 'outline'}
            size="sm"
          >
            ✅ Selesai ({orders.filter(o => o.status === 'selesai').length})
          </Button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Gagal Memuat Pesanan</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button onClick={() => fetchOrders(selectedMonth)} variant="primary">
              Coba Lagi
            </Button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-4 py-2 rounded-lg border ${getStatusColor(order.status)} font-bold text-sm flex items-center gap-2`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">Order ID:</span>
                        <span className="font-mono">#{order.id}</span>
                      </div>
                      {order.menu && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">Menu:</span>
                          <span>{order.menu.nama}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">Jumlah:</span>
                        <span>{order.jumlah}x</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">Total:</span>
                        <span className="text-blue-600 font-bold text-lg">
                          Rp {order.total_harga.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(order.tanggal).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handlePrintReceipt(order.id)}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Cetak Nota
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Belum Ada Pesanan</h3>
            <p className="text-gray-500 mb-8">Mulai pesan menu favorit Anda!</p>
            <Button variant="primary" size="lg" onClick={() => router.push('/')}>
              <Package className="w-5 h-5 mr-2" />
              Lihat Menu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

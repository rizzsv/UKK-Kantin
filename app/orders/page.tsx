'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { Package, Clock, CheckCircle, Truck, ChefHat, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/Button';

interface OrderItem {
  id: number;
  id_pesanan: number;
  id_menu: number;
  qty: number;
  harga: number;
  nama_makanan?: string;
  foto?: string;
}

interface Order {
  id: number;
  id_siswa: number;
  id_stan: number;
  status: string; // belum dikonfirm, dimasak, diantar, sampai
  tanggal: string;
  total_harga: number;
  order_items?: OrderItem[];
  stan_name?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/showorder', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'makerID': '1',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('📋 Orders data:', data);
      
      // Handle different response structures
      const ordersArray = Array.isArray(data) ? data : (data?.data || []);
      setOrders(ordersArray);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'belum dikonfirm':
      case 'belum dikonfirmasi':
      case 'not confirmed':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Menunggu Konfirmasi',
          step: 0,
        };
      case 'dimasak':
      case 'cooked':
        return {
          icon: <ChefHat className="w-5 h-5" />,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Sedang Dimasak',
          step: 1,
        };
      case 'diantar':
      case 'delivered':
        return {
          icon: <Truck className="w-5 h-5" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Sedang Diantar',
          step: 2,
        };
      case 'sampai':
      case 'arrived':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Pesanan Sampai',
          step: 3,
        };
      default:
        return {
          icon: <Package className="w-5 h-5" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status,
          step: 0,
        };
    }
  };

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
    <AuthGuard requiredRole="student">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Orders</span>
          </h1>
          <p className="text-xl text-gray-600">Track your order status and history</p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={fetchOrders}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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
            <Button onClick={fetchOrders} variant="primary">
              Coba Lagi
            </Button>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 font-semibold">Order #{order.id}</span>
                      <span className="text-gray-400 text-sm">
                        {new Date(order.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border ${statusInfo.color} font-semibold text-sm flex items-center gap-2`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Order Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      {['Konfirmasi', 'Dimasak', 'Diantar', 'Sampai'].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                            idx <= statusInfo.step
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {idx < statusInfo.step ? '✓' : idx + 1}
                          </div>
                          <span className={`text-xs font-medium ${
                            idx <= statusInfo.step ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${(statusInfo.step / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-700">{item.nama_makanan || `Menu #${item.id_menu}`}</span>
                            <span className="text-gray-500">×{item.qty}</span>
                          </div>
                          <span className="text-gray-700 font-semibold">
                            Rp {(item.harga * item.qty).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-lg font-bold text-gray-800">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-blue-600">
                      Rp {order.total_harga.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })}
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
    </AuthGuard>
  );
}

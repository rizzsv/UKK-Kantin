'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Package, ChefHat, Truck, CheckCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';

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
  status: string;
  tanggal: string;
  total_harga: number;
  order_items?: OrderItem[];
  student_name?: string;
  nama_siswa?: string;
}

const ORDER_STATUSES = [
  { value: 'all', label: 'Semua Pesanan', icon: Package, color: 'gray' },
  { value: 'belum dikonfirm', label: 'Belum Dikonfirmasi', icon: AlertCircle, color: 'gray' },
  { value: 'dimasak', label: 'Dimasak', icon: ChefHat, color: 'yellow' },
  { value: 'diantar', label: 'Diantar', icon: Truck, color: 'blue' },
  { value: 'sampai', label: 'Sampai', icon: CheckCircle, color: 'green' },
];

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders(selectedStatus);
  }, [selectedStatus]);

  const fetchOrders = async (status: string) => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      setError('Please login as admin');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching orders with status:', status);

      let ordersArray: Order[] = [];

      // If "all" is selected, fetch from all status endpoints
      if (status === 'all') {
        const statuses = ['belum dikonfirm', 'dimasak', 'diantar', 'sampai'];
        const allOrders: Order[] = [];

        for (const statusName of statuses) {
          try {
            const response = await fetch(`/api/getorder/${encodeURIComponent(statusName)}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'makerID': '1',
              },
            });

            if (response.ok) {
              const data = await response.json();
              const statusOrders = Array.isArray(data) ? data : (data?.data || []);
              allOrders.push(...statusOrders);
              console.log(`✅ Fetched ${statusOrders.length} orders for status: ${statusName}`);
            }
          } catch (err) {
            console.error(`Error fetching status ${statusName}:`, err);
          }
        }

        ordersArray = allOrders;
        console.log('✅ Total orders fetched from all statuses:', ordersArray.length);
      } else {
        // Fetch specific status
        const response = await fetch(`/api/getorder/${encodeURIComponent(status)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'makerID': '1',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        console.log('📋 Orders data received:', data);
        console.log('📊 Data structure:', {
          isArray: Array.isArray(data),
          hasData: !!data?.data,
          dataType: typeof data,
        });

        ordersArray = Array.isArray(data) ? data : (data?.data || []);
        console.log('✅ Parsed orders array length:', ordersArray.length);
      }

      if (ordersArray.length > 0) {
        console.log('📝 First order sample:', ordersArray[0]);
        console.log('📦 Order structure check:', {
          hasOrderItems: !!ordersArray[0].order_items,
          hasDetail: !!ordersArray[0].detail,
          hasTotalHarga: !!ordersArray[0].total_harga,
          orderItemsLength: ordersArray[0].order_items?.length,
          detailLength: ordersArray[0].detail?.length,
        });
      }

      setOrders(ordersArray);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);

    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      alert('Please login as admin');
      setUpdatingOrderId(null);
      return;
    }

    try {
      const response = await fetch(`/api/updatestatus/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'makerID': '1',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      console.log('✅ Status updated:', data);
      
      // Refresh orders list
      await fetchOrders(selectedStatus);
      
      alert('Status pesanan berhasil diupdate!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Gagal mengupdate status: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusConfig = ORDER_STATUSES.find(s => s.value === statusLower) || ORDER_STATUSES[0];
    
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
    };

    return {
      ...statusConfig,
      colorClass: colorClasses[statusConfig.color as keyof typeof colorClasses],
    };
  };

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = ORDER_STATUSES.findIndex(s => s.value === currentStatus.toLowerCase());
    if (currentIndex < ORDER_STATUSES.length - 1) {
      return ORDER_STATUSES[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Pesanan</h2>
        <Button
          onClick={() => fetchOrders(selectedStatus)}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {ORDER_STATUSES.map((status) => {
          const count = status.value === 'all' 
            ? orders.length 
            : orders.filter(o => o.status.toLowerCase() === status.value).length;
          
          return (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedStatus === status.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <status.icon className={`w-5 h-5 ${
                  selectedStatus === status.value ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div className={`text-sm font-semibold ${
                selectedStatus === status.value ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {status.label}
              </div>
              <div className={`text-xs mt-1 ${
                selectedStatus === status.value ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {count} pesanan
              </div>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Error</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const nextStatus = getNextStatus(order.status);
            const Icon = statusInfo.icon;
            
            // Support both 'detail' and 'order_items' array names
            const orderItems = order.order_items || order.detail || [];
            
            // Calculate total from order items if not provided
            // Support both 'harga_beli' and 'harga' field names
            const totalHarga = order.total_harga || 
              (orderItems.reduce((sum, item) => {
                const price = item.harga_beli || item.harga || 0;
                const qty = item.qty || 0;
                console.log(`💰 Item calc: price=${price}, qty=${qty}, subtotal=${price * qty}`);
                return sum + (price * qty);
              }, 0));
            
            console.log(`📊 Order #${order.id} total: ${totalHarga}`);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-800">Order #{order.id}</span>
                      <span className={`px-3 py-1 rounded-lg border text-sm font-semibold flex items-center gap-2 ${statusInfo.colorClass}`}>
                        <Icon className="w-4 h-4" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(order.tanggal).toLocaleString('id-ID')}
                      </div>
                      {(order.student_name || order.nama_siswa) && (
                        <div>Pelanggan: <span className="font-semibold">{order.student_name || order.nama_siswa}</span></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {orderItems && orderItems.length > 0 && (
                  <div className="mb-4 border-t border-b border-gray-200 py-4 space-y-2">
                    {orderItems.map((item, idx) => {
                      const price = item.harga_beli || item.harga || 0;
                      return (
                        <div key={item.id || idx} className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-800">{item.nama_makanan || item.nama_menu || `Menu #${item.id_menu}`}</span>
                            <span className="text-gray-500 ml-2">×{item.qty}</span>
                          </div>
                          <span className="text-gray-700 font-semibold">
                            Rp {(price * item.qty).toLocaleString('id-ID')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-800">
                    Total: <span className="text-blue-600">Rp {totalHarga.toLocaleString('id-ID')}</span>
                  </div>
                  
                  {nextStatus && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, nextStatus.value)}
                      variant="primary"
                      size="sm"
                      disabled={updatingOrderId === order.id}
                    >
                      {updatingOrderId === order.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          Update ke: {nextStatus.label}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak Ada Pesanan</h3>
          <p className="text-gray-500">Belum ada pesanan dengan status "{ORDER_STATUSES.find(s => s.value === selectedStatus)?.label}"</p>
        </div>
      )}
    </div>
  );
}

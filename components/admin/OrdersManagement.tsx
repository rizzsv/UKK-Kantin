'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Package, ChefHat, Truck, CheckCircle, AlertCircle, RefreshCw, Clock, Calendar, TrendingUp } from 'lucide-react';

interface OrderItem {
  id: number;
  id_transaksi?: number;
  id_pesanan?: number;
  id_menu: number;
  qty: number;
  harga_beli?: number;
  harga?: number;
  nama_makanan?: string;
  nama_menu?: string;
  foto?: string;
  created_at?: string;
  updated_at?: string;
}

interface Order {
  id: number;
  tanggal: string;
  id_siswa: number;
  id_stan: number;
  status: string;
  maker_id: number;
  created_at: string;
  updated_at: string;
  detail_trans?: OrderItem[];
  order_items?: OrderItem[];
  detail?: OrderItem[];
  total_harga?: number;
  student_name?: string;
  nama_siswa?: string;
}

const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders', icon: Package, color: 'gray' },
  { value: 'belum dikonfirm', label: 'Pending Confirmation', icon: AlertCircle, color: 'gray' },
  { value: 'dimasak', label: 'Being Prepared', icon: ChefHat, color: 'yellow' },
  { value: 'diantar', label: 'On Delivery', icon: Truck, color: 'blue' },
  { value: 'sampai', label: 'Delivered', icon: CheckCircle, color: 'green' },
];

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Monthly revenue states
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<any>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  useEffect(() => {
    fetchOrders(selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    fetchMonthlyRevenue(selectedMonth);
  }, [selectedMonth]);

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
            // Use slash format: /api/getorder/dimasak (dynamic route)
            const endpoint = `/api/getorder/${encodeURIComponent(statusName)}`;
            console.log(`🌐 Fetching from: ${endpoint}`);

            const response = await fetch(endpoint, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'makerID': '1',
              },
            });

            console.log(`📡 Response status: ${response.status} OK: ${response.ok}`);

            if (response.ok) {
              const data = await response.json();
              console.log(`📦 Raw data for ${statusName}:`, data);

              // Handle response structure: { status: "success", message: "...", data: [...] }
              const statusOrders = Array.isArray(data?.data) ? data.data : [];
              allOrders.push(...statusOrders);
              console.log(`✅ Fetched ${statusOrders.length} orders for status: ${statusName}`);
            } else {
              const errorText = await response.text();
              console.error(`❌ Failed response for ${statusName}:`, response.status, errorText);
            }
          } catch (err) {
            console.error(`❌ Error fetching status ${statusName}:`, err);
          }
        }

        ordersArray = allOrders;
        console.log('✅ Total orders fetched from all statuses:', ordersArray.length);
      } else {
        // Fetch specific status - use slash format: /api/getorder/dimasak (dynamic route)
        const endpoint = `/api/getorder/${encodeURIComponent(status)}`;
        console.log(`🌐 Fetching from: ${endpoint}`);

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'makerID': '1',
          },
        });

        console.log(`📡 Response status: ${response.status} OK: ${response.ok}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed response:', response.status, errorText);
          throw new Error(`Failed to fetch orders: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('📋 Raw orders data received:', JSON.stringify(data, null, 2));

        // Handle response structure: { status: "success", message: "...", data: [...] }
        ordersArray = Array.isArray(data?.data) ? data.data : [];
        console.log('✅ Parsed orders array length:', ordersArray.length);
      }

      if (ordersArray.length > 0) {
        console.log('📝 First order sample:', JSON.stringify(ordersArray[0], null, 2));
      }

      setOrders(ordersArray);
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
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
      // Use URL-encoded form data as per API specification
      const params = new URLSearchParams();
      params.append('status', newStatus);

      console.log('🔄 Updating order:', orderId, 'to status:', newStatus);

      const response = await fetch(`/api/updatestatus/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'makerID': '1',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      console.log('📡 Response status:', response.status, 'OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to update order status: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Status updated:', data);

      // Refresh orders list
      await fetchOrders(selectedStatus);

      // Refresh monthly revenue to update income
      console.log('🔄 Refreshing monthly revenue after order update...');
      await fetchMonthlyRevenue(selectedMonth);

      alert('Order status successfully updated!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const fetchMonthlyRevenue = async (date: string) => {
    setLoadingRevenue(true);

    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      console.error('No auth token found');
      setLoadingRevenue(false);
      return;
    }

    try {
      console.log('🔍 Fetching monthly revenue for:', date);

      const response = await fetch(`/api/showpemasukanbybulan/${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'makerID': '1',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch monthly revenue');
      }

      const data = await response.json();
      console.log('💰 Monthly revenue data:', data);
      setMonthlyRevenue(data);
    } catch (err) {
      console.error('Error fetching monthly revenue:', err);
      setMonthlyRevenue(null);
    } finally {
      setLoadingRevenue(false);
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
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
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

      {/* Monthly Revenue Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <h3 className="text-xl font-bold">Monthly Revenue</h3>
          </div>
          <input
            type="month"
            value={selectedMonth.slice(0, 7)}
            onChange={(e) => setSelectedMonth(`${e.target.value}-01`)}
            className="px-4 py-2 rounded-lg text-gray-800 border-0 focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {loadingRevenue ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          </div>
        ) : monthlyRevenue ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <div className="text-3xl font-bold">
                Rp {(monthlyRevenue.data?.total_pemasukan || monthlyRevenue.total_pemasukan || 0).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Total Orders</span>
              </div>
              <div className="text-3xl font-bold">
                {monthlyRevenue.data?.total_pesanan || monthlyRevenue.total_pesanan || 0}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Completed Orders</span>
              </div>
              <div className="text-3xl font-bold">
                {monthlyRevenue.data?.pesanan_selesai || monthlyRevenue.pesanan_selesai || 0}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-white/80">
            <p>No revenue data for this month yet</p>
          </div>
        )}
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
                {count} {count === 1 ? 'order' : 'orders'}
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
            
            // Support 'detail_trans', 'detail', and 'order_items' array names
            const orderItems = order.detail_trans || order.order_items || order.detail || [];

            // Calculate total from order items if not provided
            // NOTE: harga_beli is already the TOTAL price (unit_price * qty), not unit price
            // So we should NOT multiply by qty again
            const totalHarga = order.total_harga ||
              (orderItems.reduce((sum, item) => {
                const totalPrice = item.harga_beli || item.harga || 0;
                const qty = item.qty || 1;
                const unitPrice = totalPrice / qty;
                console.log(`💰 Item: unit=${unitPrice}, qty=${qty}, total=${totalPrice}`);
                return sum + totalPrice;
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
                        <div>Customer: <span className="font-semibold">{order.student_name || order.nama_siswa}</span></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {orderItems && orderItems.length > 0 && (
                  <div className="mb-4 border-t border-b border-gray-200 py-4 space-y-2">
                    {orderItems.map((item, idx) => {
                      // harga_beli is already the TOTAL price (unit_price * qty)
                      const totalPrice = item.harga_beli || item.harga || 0;
                      const qty = item.qty || 1;
                      const unitPrice = totalPrice / qty;
                      const displayName = item.nama_makanan || item.nama_menu || `Menu ID: ${item.id_menu}`;
                      return (
                        <div key={item.id || idx} className="flex justify-between items-center">
                          <div className="flex-1">
                            <span className="text-gray-800 font-medium">{displayName}</span>
                            <div className="text-sm text-gray-500 mt-1">
                              Rp {unitPrice.toLocaleString('id-ID')} × {qty}
                            </div>
                          </div>
                          <span className="text-gray-700 font-semibold">
                            Rp {totalPrice.toLocaleString('id-ID')}
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
                          Update to: {nextStatus.label}
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
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders</h3>
          <p className="text-gray-500">No orders with status "{ORDER_STATUSES.find(s => s.value === selectedStatus)?.label}"</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useOrders } from '@/lib/hooks';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { Button } from '@/components/Button';
import { Package, Truck, CheckCircle, Calendar, User, DollarSign } from 'lucide-react';

export default function OrdersPage() {
  const { orders, loading, error } = useOrders();
  const [statusFilter, setStatusFilter] = useState<'all' | 'dikemas' | 'dikirim' | 'selesai'>('all');

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Orders</span>
          </h1>
          <p className="text-xl text-gray-600">Track and manage your food orders</p>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Button
            onClick={() => setStatusFilter('all')}
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
          >
            All Orders
          </Button>
          <Button
            onClick={() => setStatusFilter('dikemas')}
            variant={statusFilter === 'dikemas' ? 'primary' : 'outline'}
            size="sm"
          >
            📦 Being Packaged
          </Button>
          <Button
            onClick={() => setStatusFilter('dikirim')}
            variant={statusFilter === 'dikirim' ? 'primary' : 'outline'}
            size="sm"
          >
            🚚 Shipped
          </Button>
          <Button
            onClick={() => setStatusFilter('selesai')}
            variant={statusFilter === 'selesai' ? 'primary' : 'outline'}
            size="sm"
          >
            ✅ Completed
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
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Error Loading Orders</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex-1 space-y-4">
                    {/* Order Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          Order #{order.id}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.tanggal).toLocaleDateString('id-ID', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          {order.siswa && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{order.siswa.nama_siswa}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    {/* Menu Details */}
                    {order.menu && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{order.menu.nama}</p>
                            <p className="text-sm text-gray-600">Quantity: {order.jumlah}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Unit Price</p>
                            <p className="font-semibold text-gray-800">
                              Rp {order.menu.harga.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total Price */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="text-lg font-bold text-gray-800">
                        Total: <span className="text-blue-600">Rp {order.total_harga.toLocaleString('id-ID')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col gap-3">
                    <Button variant="primary" size="sm" className="flex-1 lg:flex-none">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                      Print Receipt
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-8">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet"
                : `No orders with status: ${statusFilter}`}
            </p>
            <Button variant="primary" size="lg">
              Browse Menu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

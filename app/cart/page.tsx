'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { MenuItem, apiClient } from '@/lib/api';
import { AuthGuard } from '@/components/AuthGuard';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Check for special discounts based on day/time
    checkDiscounts();
  }, []);

  const checkDiscounts = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Weekend discount (Saturday & Sunday)
    if (day === 0 || day === 6) {
      setDiscount(10);
      setDiscountCode('WEEKEND10');
    }
    // Happy hour (14:00-16:00)
    else if (hour >= 14 && hour < 16) {
      setDiscount(15);
      setDiscountCode('HAPPYHOUR15');
    }
    // Friday special
    else if (day === 5) {
      setDiscount(5);
      setDiscountCode('FRIDAY5');
    }
  };

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
  };

  const updateQuantity = (id: number | null, change: number) => {
    if (!id) return;
    const updated = cartItems.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    );
    saveCart(updated);
  };

  const removeItem = (id: number | null) => {
    if (!id) return;
    const updated = cartItems.filter(item => item.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  // Use original apiClient which works
  const handleCheckoutDirect = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    setIsProcessing(true);
    apiClient.setToken(token);

    try {
      // Group items by id_stan (stall)
      const groupedByStall = cartItems.reduce((acc, item) => {
        const stallId = item.id_stan || item.stall_id || 19;
        if (!acc[stallId]) {
          acc[stallId] = [];
        }
        acc[stallId].push({
          id_menu: item.id_menu || item.menu_id || item.id || 0,
          qty: item.quantity,
        });
        return acc;
      }, {} as Record<number, Array<{ id_menu: number; qty: number }>>);

      console.log('🛒 Grouped orders:', groupedByStall);

      // Create orders sequentially using proven apiClient
      for (const [stallId, items] of Object.entries(groupedByStall)) {
        const orderData = {
          id_stan: parseInt(stallId),
          pesan: items,
        };

        console.log('📤 Creating order:', orderData);

        try {
          const result = await apiClient.createOrder(orderData);
          console.log('✅ Order created:', result);
          toast.success('Pesanan berhasil dibuat!');
        } catch (error) {
          console.error('❌ Order failed:', error);
          throw error;
        }
      }

      // Clear cart after successful orders
      clearCart();
      
      toast.success('Semua pesanan berhasil!');
      
      // Navigate to orders page
      setTimeout(() => {
        router.push('/orders');
      }, 1000);

    } catch (err) {
      console.error('Checkout error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Gagal membuat pesanan';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthGuard requiredRole="student">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Shopping <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Cart</span>
          </h1>
          <p className="text-xl text-gray-600">Review your items before checkout</p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={getImageUrl(item.foto) || '/placeholder.png'}
                        alt={item.nama}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{item.nama}</h3>
                          <p className="text-lg font-semibold text-blue-600">
                            Rp {item.harga.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="ml-auto text-lg font-bold text-gray-800">
                          Rp {(item.harga * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-28">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                {/* Order Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tipe Pesanan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setOrderType('dine-in')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        orderType === 'dine-in'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">🍽️</div>
                      <div className="font-semibold">Dine In</div>
                      <div className="text-xs mt-1 opacity-75">Makan di tempat</div>
                    </button>
                    <button
                      onClick={() => setOrderType('takeaway')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        orderType === 'takeaway'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">🥡</div>
                      <div className="font-semibold">Takeaway</div>
                      <div className="text-xs mt-1 opacity-75">Bawa pulang</div>
                    </button>
                  </div>
                </div>

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <Tag className="w-5 h-5" />
                      <span className="font-bold">Diskon Aktif!</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Kode: <span className="font-mono font-bold">{discountCode}</span>
                    </p>
                    <p className="text-sm text-green-600">Hemat {discount}%</p>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon ({discount}%)</span>
                      <span className="font-semibold">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full mb-3"
                  onClick={handleCheckoutDirect}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </span>
                  ) : (
                    <>
                      Checkout Sekarang
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="md" 
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  Lanjut Belanja
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Keranjang Kosong</h3>
            <p className="text-gray-500 mb-8">Tambahkan menu favorit Anda!</p>
            <Button variant="primary" size="lg" onClick={() => router.push('/')}>
              <ShoppingBag className="w-5 h-5 mr-2" />
              Lihat Menu
            </Button>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}

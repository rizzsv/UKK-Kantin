'use client';

import { useState, useEffect } from 'react';
import { MenuItem } from '@/lib/api';
import { Sparkles, ShoppingCart, Calendar, ArrowLeft, Tag, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function DiscountsPage() {
  const router = useRouter();
  const [discountMenus, setDiscountMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetchDiscountMenus();

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
  }, []);

  const fetchDiscountMenus = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      console.log('🏷️ Fetching discount menus...');

      const headers: any = {
        'makerID': '1',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const discountResponse = await fetch('/api/getmenudiskonsiswa', {
        method: 'POST',
        headers,
        body: JSON.stringify({ search: '' }),
      });

      if (!discountResponse.ok) {
        throw new Error('Failed to fetch discount menus');
      }

      const discountData = await discountResponse.json();
      console.log('🏷️ Discount data:', discountData);

      // Filter active discounts
      const now = new Date();
      const allDiscounts = discountData?.data || [];
      
      const activeDiscounts = allDiscounts.filter((discount: any) => {
        const start = new Date(discount.tanggal_awal);
        const end = new Date(discount.tanggal_akhir);
        const isActive = now >= start && now <= end;
        const hasMenus = discount.menu_diskon && discount.menu_diskon.length > 0;
        return isActive && hasMenus;
      });

      console.log('✅ Active discounts:', activeDiscounts.length);
      setDiscountMenus(activeDiscounts);
    } catch (err) {
      console.error('Error fetching discount menus:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch discount menus');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart(prevCart => {
      // Use id_menu as the primary identifier for consistency
      const itemId = item.id_menu || item.id;
      const existingItemIndex = prevCart.findIndex(cartItem => (cartItem.id_menu || cartItem.id) === itemId);

      let updatedCart;
      if (existingItemIndex > -1) {
        // Increase quantity if already in cart - keep the existing price
        updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        // Add new item to cart - normalize the ID structure
        updatedCart = [...prevCart, {
          ...item,
          id: itemId, // Ensure id is set to id_menu for consistency
          id_menu: itemId,
          quantity: 1,
        }];
      }

      // Store cart in localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      return updatedCart;
    });

    // Show notification
    toast.success(`${item.nama} successfully added to cart!`);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemoveFromCart = (itemId: number | null) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => (item.id_menu || item.id) !== itemId);
      // Update localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleUpdateQuantity = (itemId: number | null, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        (item.id_menu || item.id) === itemId ? { ...item, quantity: newQuantity } : item
      );
      // Update localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handlePlaceOrder = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is still empty!');
      return;
    }

    // Group items by stall (id_stan)
    const groupedByStall = cart.reduce((acc, item) => {
      const stallId = item.id_stan || 0;
      if (!acc[stallId]) {
        acc[stallId] = [];
      }
      acc[stallId].push({
        id_menu: item.id_menu || item.id || 0,
        qty: item.quantity,
      });
      return acc;
    }, {} as Record<number, Array<{ id_menu: number; qty: number }>>);

    setOrdering(true);

    try {
      // Create orders for each stall
      const orderPromises = Object.keys(groupedByStall).map(stallId =>
        apiClient.createOrder({
          id_stan: parseInt(stallId),
          pesan: groupedByStall[parseInt(stallId)],
        })
      );

      await Promise.all(orderPromises);

      // Clear cart and redirect to orders
      setCart([]);
      setShowCart(false);
      localStorage.removeItem('cart');
      toast.success('Order successfully created! Please check your order status.');
      router.push('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
            {cartItemCount}
          </span>
        </button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />

          {/* Cart Panel */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto animate-slide-in-right">
            {/* Cart Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Order Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart</p>
            </div>

            {/* Cart Items */}
            <div className="p-6 space-y-4">
              {cart.map(item => (
                <div key={item.id_menu || item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.nama}</h3>
                      <p className="text-sm text-blue-600 font-bold">
                        Rp {item.harga.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-gray-900">
                      Rp {(item.harga * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-gray-700">Total:</span>
                <span className="font-bold text-2xl text-blue-600">
                  Rp {cartTotal.toLocaleString('id-ID')}
                </span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                variant="primary"
                size="lg"
                disabled={ordering || cart.length === 0}
                className="w-full"
              >
                {ordering ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Place Order
                  </span>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Orders will be grouped by stall
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto relative z-10">
          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-white hover:bg-gray-600 px-4 py-2 rounded-lg transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Menu</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-full text-base font-bold mb-6 animate-bounce-slow shadow-xl">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
              <span className="tracking-wide">SPECIAL PROMO!</span>
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <h1 className="text-6xl font-extrabold text-gray-900 mb-4">
              Menu <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Special Discount</span>
            </h1>
            <p className="text-gray-700 text-xl font-medium mb-6">Save up to tens of percent on selected menus! 🎉</p>
            
            {!loading && discountMenus.length > 0 && (
              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg">
                <Tag className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-semibold">
                  <span className="text-2xl font-black text-blue-600">{discountMenus.length}</span> Promo Aktif
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Discount Menu Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="text-7xl animate-bounce">🏷️</div>
                <div className="absolute -top-4 -right-8 text-4xl animate-spin-slow">💰</div>
                <div className="absolute -bottom-2 -left-8 text-3xl animate-pulse">✨</div>
              </div>
              <p className="text-gray-700 text-lg font-semibold">Loading special promo for you...</p>
              <p className="text-gray-600 text-sm mt-2">Please wait! 🎉</p>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="text-6xl mb-6">😢</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Failed to Load Promo</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchDiscountMenus} variant="primary">
                Try Again
              </Button>
            </div>
          ) : discountMenus.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="text-8xl mb-6">🎁</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">No Active Promo Yet</h3>
              <p className="text-gray-600 mb-6">Currently there are no special promos. Check back later!</p>
              <Button onClick={() => router.push('/')} variant="primary">
                View Regular Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-16">
              {discountMenus.map((discount, discountIndex) => (
                <div key={discount.id} className="animate-fade-in-up" style={{ animationDelay: `${discountIndex * 100}ms` }}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-100">
                    <div className="flex items-center gap-5">
                      <div className="relative w-24 h-24 group/badge">
                        {/* 3D Shadow Layers */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-800 rounded-[28px] transform translate-y-2 translate-x-1 opacity-40 blur-sm"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[26px] transform translate-y-1 translate-x-0.5 opacity-60"></div>
                        
                        {/* Main Badge */}
                        <div className="relative w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl transform group-hover/badge:scale-110 group-hover/badge:rotate-6 transition-all duration-300">
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent rounded-[24px] opacity-70"></div>
                          <div className="absolute top-2 left-2 w-8 h-8 bg-white/30 rounded-full blur-xl"></div>
                          
                          {/* Percentage Text */}
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-4xl font-black text-white leading-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{discount.persentase_diskon}</span>
                            <span className="text-sm font-black text-white/90 leading-none mt-0.5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>OFF</span>
                          </div>
                          
                          {/* Sparkle Decorations */}
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">{discount.nama_diskon}</h2>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-600 font-medium">
                            Berlaku sampai <span className="font-bold text-blue-600">{new Date(discount.tanggal_akhir).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 px-8 py-4 rounded-2xl border-2 border-blue-200 shadow-md">
                      <p className="text-base font-bold text-blue-800 text-center">
                        <span className="text-3xl font-black text-blue-600">{discount.menu_diskon.length}</span>
                        <span className="block text-sm mt-1">Menu Tersedia</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {discount.menu_diskon.map((menu: any, menuIndex: number) => {
                      const originalPrice = menu.harga;
                      const discountedPrice = originalPrice - (originalPrice * discount.persentase_diskon / 100);
                      const savings = originalPrice - discountedPrice;

                      return (
                        <div
                          key={`${menu.id}-${menuIndex}`}
                          className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in-up relative flex flex-col h-full group hover:scale-105 border-2 border-transparent hover:border-blue-200"
                          style={{ animationDelay: `${menuIndex * 50}ms` }}
                        >
                          {/* Discount Badge - 3D Design */}
                          <div className="absolute top-4 right-4 z-10">
                            <div className="relative w-16 h-16 group/card-badge">
                              {/* 3D Shadow */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-800 rounded-[20px] transform translate-y-1.5 translate-x-1 opacity-30 blur-sm"></div>
                              
                              {/* Main Badge */}
                              <div className="relative w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-[18px] flex items-center justify-center shadow-xl transform rotate-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                                {/* Shine */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent rounded-[18px] opacity-70"></div>
                                <div className="absolute top-1 left-1 w-6 h-6 bg-white/30 rounded-full blur-lg"></div>
                                
                                {/* Text */}
                                <div className="relative z-10 flex flex-col items-center leading-none">
                                  <span className="text-xl font-black text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>-{discount.persentase_diskon}</span>
                                  <span className="text-[10px] font-black text-white/90 -mt-0.5" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>OFF</span>
                                </div>
                                
                                {/* Sparkles */}
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                              </div>
                            </div>
                          </div>

                          {/* Image Section */}
                          <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                            <img
                              src={`https://ukk-p2.smktelkom-mlg.sch.id/${menu.foto}`}
                              alt={menu.nama_makanan}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>

                          {/* Content Section */}
                          <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-white transition-colors">
                              {menu.nama_makanan}
                            </h3>
                            <p className="text-sm text-gray-600 mb-5 line-clamp-2 flex-grow leading-relaxed">
                              {menu.deskripsi || 'Delicious and quality food'}
                            </p>

                            {/* Price Section */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 mb-5 border border-blue-200">
                              <p className="text-xs text-gray-500 line-through mb-1 font-medium">
                                Normal Price: Rp {originalPrice.toLocaleString('id-ID')}
                              </p>
                              <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                                Rp {Math.round(discountedPrice).toLocaleString('id-ID')}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">
                                  💰 Save Rp {Math.round(savings).toLocaleString('id-ID')}
                                </div>
                              </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              onClick={() => handleAddToCart({
                                id: menu.id_menu,
                                nama: menu.nama_makanan,
                                harga: Math.round(discountedPrice),
                                deskripsi: menu.deskripsi,
                                foto: menu.foto,
                                kategori: menu.jenis as 'makanan' | 'minuman',
                                id_menu: menu.id_menu,
                                id_stan: menu.id_stan,
                                discount_name: discount.nama_diskon,
                                discount_percentage: discount.persentase_diskon,
                              })}
                              className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white py-4 rounded-2xl font-black text-base hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                            >
                              <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

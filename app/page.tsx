'use client';

import { useState, useEffect, useMemo } from 'react';
import { MenuItem, apiClient } from '@/lib/api';
import { MenuCard } from '@/components/MenuCard';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/Button';
import { Sparkles, UtensilsCrossed, Clock, Star, ShoppingCart, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function Home() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'drink'>('food');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch real data from API with search support
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load token from localStorage if exists
        const token = localStorage.getItem('authToken');
        console.log('🔐 Auth Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token found');

        if (token) {
          apiClient.setToken(token);
          console.log('✅ Token set to API client');
        } else {
          console.log('⚠️ No token found, attempting to fetch without auth');
        }

        // Fetch from ONLY ONE endpoint based on activeCategory WITH search query
        let response = null;
        let type: 'food' | 'drink' = 'food';

        if (activeCategory === 'food') {
          // Send search query to API for food
          response = await apiClient.getFoodMenu(debouncedSearchQuery);
          type = 'food';
        } else if (activeCategory === 'drink') {
          // Send search query to API for drinks
          response = await apiClient.getBeverageMenu(debouncedSearchQuery);
          type = 'drink';
        } else if (activeCategory === 'all') {
          // For 'all', fetch both with search and combine
          const foodResponse = await apiClient.getFoodMenu(debouncedSearchQuery);
          const drinkResponse = await apiClient.getBeverageMenu(debouncedSearchQuery);
          const foodData = foodResponse ? (Array.isArray(foodResponse) ? foodResponse : (foodResponse?.data || [])) : [];
          const drinkData = drinkResponse ? (Array.isArray(drinkResponse) ? drinkResponse : (drinkResponse?.data || [])) : [];

          const combinedMenu: MenuItem[] = [
            ...foodData.map((item: any) => ({
              id: item.id || item.id_menu || item.menu_id,
              nama: item.nama || item.nama_makanan || item.food_name || '',
              harga: parseFloat(item.harga || item.price) || 0,
              deskripsi: item.deskripsi || item.description || '',
              foto: item.foto || item.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
              type: item.type || 'food',
              kategori: item.jenis || 'makanan',
              id_menu: item.id_menu || item.menu_id,
              id_stan: item.id_stan || item.stall_id,
              discount_name: item.nama_diskon || item.discount_name,
              discount_percentage: item.persentase_diskon || item.discount_percentage,
            })),
            ...drinkData.map((item: any) => ({
              id: item.id || item.id_menu || item.menu_id,
              nama: item.nama || item.nama_makanan || item.food_name || '',
              harga: parseFloat(item.harga || item.price) || 0,
              deskripsi: item.deskripsi || item.description || '',
              foto: item.foto || item.photo || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
              type: item.type || 'drink',
              kategori: item.jenis || 'minuman',
              id_menu: item.id_menu || item.menu_id,
              id_stan: item.id_stan || item.stall_id,
              discount_name: item.nama_diskon || item.discount_name,
              discount_percentage: item.persentase_diskon || item.discount_percentage,
            })),
          ];

          console.log('📦 Combined Menu (all):', combinedMenu);
          console.log('🔍 Search query used:', debouncedSearchQuery);
          setMenuItems(combinedMenu);
          return; // Early return for 'all' case
        }

        console.log(`🍽️ ${type === 'food' ? 'Food' : 'Drink'} Response:`, response);
        console.log(`🔍 Search query sent to API: "${debouncedSearchQuery}"`);

        // Handle API response structure
        const data = response ? (Array.isArray(response) ? response : (response?.data || [])) : [];

        console.log(`📊 Processed ${type} data count:`, data.length);
        if (data.length > 0) console.log('📋 Sample item:', data[0]);

        // Format the data - use jenis field from API to determine type
        const menu: MenuItem[] = data.map((item: any) => {
          const jenis = item.jenis || item.type || type;
          return {
            id: item.id || item.id_menu || item.menu_id,
            nama: item.nama || item.nama_makanan || item.food_name || '',
            harga: parseFloat(item.harga || item.price) || 0,
            deskripsi: item.deskripsi || item.description || '',
            foto: item.foto || item.photo || (type === 'food' ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' : 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80'),
            type: jenis === 'makanan' ? 'food' : jenis === 'minuman' ? 'drink' : type,
            kategori: jenis,
            // Include additional fields
            id_menu: item.id_menu || item.menu_id,
            id_stan: item.id_stan || item.stall_id,
            discount_name: item.nama_diskon || item.discount_name,
            discount_percentage: item.persentase_diskon || item.discount_percentage,
          };
        });

        console.log(`📦 ${type} Menu:`, menu);
        console.log('📂 Active category:', activeCategory);
        console.log('✅ Items fetched from API:', menu.length);
        setMenuItems(menu); // REPLACE, don't append
      } catch (err) {
        console.error('Error fetching menu:', err);

        // If unauthorized, use mock data as fallback
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          console.warn('⚠️ Using mock data (token expired or not logged in)');
          const mockData: MenuItem[] = [
            {
              id: 1,
              nama: 'Nasi Goreng Special',
              harga: 25000,
              deskripsi: 'Delicious fried rice with chicken and vegetables',
              foto: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
              kategori: 'makanan',
              type: 'food',
            },
            {
              id: 2,
              nama: 'Mie Ayam',
              harga: 20000,
              deskripsi: 'Traditional chicken noodles with savory broth',
              foto: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80',
              kategori: 'makanan',
              type: 'food',
            },
            {
              id: 3,
              nama: 'Es Teh Manis',
              harga: 5000,
              deskripsi: 'Refreshing sweet iced tea',
              foto: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
              kategori: 'minuman',
              type: 'drink',
            },
            {
              id: 4,
              nama: 'Jus Jeruk',
              harga: 10000,
              deskripsi: 'Fresh orange juice',
              foto: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
              kategori: 'minuman',
              type: 'drink',
            },
          ];
          setMenuItems(mockData);
          setError(''); // Clear error, show mock data instead
        } else {
          setError('Gagal memuat menu. Silakan coba lagi.');
          setMenuItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [activeCategory, debouncedSearchQuery]); // Re-fetch when category OR search changes

  // Since we're doing server-side filtering, no need for client-side filtering
  // Just return the menuItems as-is
  const filteredItems = menuItems;

  const handleAddToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);

      if (existingItemIndex > -1) {
        // Increase quantity if already in cart
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (itemId: number | null) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number | null, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handlePlaceOrder = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login first to place an order!');
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is still empty!');
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
      alert('Order successfully placed! Please check your order status.');
      router.push('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Floating Cart Button */}
      {cart.length > 0 && (
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
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in-down">
              <Sparkles className="w-4 h-4" />
              <span>Fresh & Delicious Every Day</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                CanteenHub
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Order your favorite meals quickly and easily. Fresh ingredients, authentic taste, delivered with care.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in-up animation-delay-400">
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-md">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Fast Service</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-md">
                <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Fresh Ingredients</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-md">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Promo Banner */}
          <div className="mb-10">
            <button
              onClick={() => router.push('/discounts')}
              className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                    <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl md:text-3xl font-black mb-1">Menu Diskon Spesial! 🎉</h3>
                    <p className="text-white/90 text-sm md:text-base">Hemat hingga puluhan persen untuk menu pilihan</p>
                  </div>
                </div>
                <div className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-lg group-hover:scale-110 transition-transform">
                  Lihat Promo →
                </div>
              </div>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-10 space-y-6">
            <div className="relative">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for your favorite dish..."
              />
              {searchQuery !== debouncedSearchQuery && (
                <div className="absolute -bottom-6 left-0 text-xs text-gray-500 flex items-center gap-1">
                  <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Searching...</span>
                </div>
              )}
            </div>

            {/* Show search results info */}
            {debouncedSearchQuery && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Showing search results for: <span className="font-semibold text-blue-600">"{debouncedSearchQuery}"</span>
                  {filteredItems.length > 0 && (
                    <span className="ml-2 text-gray-500">({filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found)</span>
                  )}
                </p>
              </div>
            )}

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => setActiveCategory('all')}
                variant={activeCategory === 'all' ? 'primary' : 'outline'}
                size="sm"
              >
                All Menu
              </Button>
              <Button
                onClick={() => setActiveCategory('food')}
                variant={activeCategory === 'food' ? 'primary' : 'outline'}
                size="sm"
              >
                🍔 Food
              </Button>
              <Button
                onClick={() => setActiveCategory('drink')}
                variant={activeCategory === 'drink' ? 'primary' : 'outline'}
                size="sm"
              >
                🥤 Drinks
              </Button>
            </div>
          </div>

          {/* Menu Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                {/* Animated Food Icons */}
                <div className="text-7xl animate-bounce">🍜</div>
                <div className="absolute -top-4 -right-8 text-4xl animate-spin-slow">🍕</div>
                <div className="absolute -bottom-2 -left-8 text-3xl animate-pulse">🍔</div>
              </div>
              <p className="text-gray-600 text-lg font-semibold">Loading delicious menus for you...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait! 😋</p>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full -ml-12 -mb-12 opacity-50"></div>

                {/* Animated Food Icons */}
                <div className="mb-6 relative">
                  <div className="text-8xl animate-wiggle inline-block">😢</div>
                  <div className="absolute -top-2 -right-4 text-4xl animate-float">🍝</div>
                  <div className="absolute -bottom-2 -left-4 text-4xl animate-float animation-delay-1000">🥗</div>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  Oops! Menu Is On Break
                </h3>

                {/* Message */}
                <p className="text-gray-600 mb-2 text-lg">
                  Our menu is experiencing technical difficulties
                </p>
                <p className="text-gray-500 mb-8 text-sm bg-gray-50 rounded-lg p-3 inline-block">
                  {error}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="primary"
                    size="lg"
                    className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </Button>
                  <Button
                    onClick={() => setError('')}
                    variant="outline"
                    size="lg"
                    className="hover:scale-105 transition-transform"
                  >
                    Close
                  </Button>
                </div>

                {/* Help Text */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    🍴 <span className="font-semibold">Don't worry!</span> Menu will be back soon
                  </p>
                </div>
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MenuCard item={item} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center overflow-hidden relative">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-40 h-40 bg-blue-100 rounded-full -ml-20 -mt-20 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mb-16 opacity-50"></div>
                
                {/* Empty State with Food Animation */}
                <div className="mb-6 relative">
                  <div className="inline-flex items-center justify-center">
                    <div className="text-8xl animate-bounce-slow">🍽️</div>
                  </div>
                  <div className="absolute -top-4 -right-12 text-5xl animate-float">🔍</div>
                  <div className="absolute top-8 -left-12 text-4xl animate-float animation-delay-500">🥘</div>
                  <div className="absolute -bottom-2 right-4 text-3xl animate-pulse">✨</div>
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {debouncedSearchQuery ? 'Menu Not Found' : 'Menu Empty'}
                </h3>

                {/* Message */}
                <p className="text-gray-600 mb-8 text-lg">
                  {debouncedSearchQuery
                    ? (
                      <>
                        No menu matches <span className="font-bold text-blue-600">"{debouncedSearchQuery}"</span>
                        <div className="mt-2 text-sm text-gray-500">Try different keywords or select another category</div>
                      </>
                    )
                    : (
                      <>
                        No {activeCategory === 'food' ? '🍔 food' : activeCategory === 'drink' ? '🥤 drinks' : 'menu'} available yet
                        <div className="mt-2 text-sm text-gray-500">Our chefs are preparing special menus!</div>
                      </>
                    )
                  }
                </p>

                {/* Suggestions Box */}
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-6 mb-8 border border-blue-100">
                  <div className="text-4xl mb-3">💡</div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">What you can try:</p>
                  <ul className="text-sm text-gray-600 space-y-2 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Change search keywords</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Select "All Menu" category</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Reset all filters</span>
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    variant="primary"
                    size="lg"
                    className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    🔄 Reset Filter
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="lg"
                    className="hover:scale-105 transition-transform"
                  >
                    ♻️ Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-xl mb-8 opacity-90">
              Browse our menu and place your order now!
            </p>
            <Button variant="secondary" size="lg">
              View Full Menu
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

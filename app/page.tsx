'use client';

import { useState, useEffect } from 'react';
import { MenuItem, apiClient } from '@/lib/api';
import { MenuCard } from '@/components/MenuCard';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/Button';
import { Sparkles, UtensilsCrossed, Clock, Star } from 'lucide-react';

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'makanan' | 'minuman'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real data from API
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

        // Fetch both food and beverage menus
        const [foodResponse, beverageResponse] = await Promise.all([
          apiClient.getFoodMenu(''),
          apiClient.getBeverageMenu(''),
        ]);

        console.log('🍔 Food Response:', foodResponse);
        console.log('🥤 Beverage Response:', beverageResponse);

        // Handle API response structure (may have .data wrapper or direct array)
        const foodData = Array.isArray(foodResponse) ? foodResponse : (foodResponse?.data || []);
        const beverageData = Array.isArray(beverageResponse) ? beverageResponse : (beverageResponse?.data || []);

        // Combine and format the data with Indonesian field names support
        const combinedMenu: MenuItem[] = [
          ...foodData.map((item: any) => ({
            id: item.id || item.id_menu || item.menu_id,
            nama: item.nama || item.nama_makanan || item.food_name || '',
            harga: parseFloat(item.harga || item.price) || 0,
            deskripsi: item.deskripsi || item.description || '',
            foto: item.foto || item.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
            kategori: 'makanan' as const,
            // Include additional fields
            id_menu: item.id_menu || item.menu_id,
            id_stan: item.id_stan || item.stall_id,
            discount_name: item.nama_diskon || item.discount_name,
            discount_percentage: item.persentase_diskon || item.discount_percentage,
          })),
          ...beverageData.map((item: any) => ({
            id: item.id || item.id_menu || item.menu_id,
            nama: item.nama || item.nama_makanan || item.food_name || '',
            harga: parseFloat(item.harga || item.price) || 0,
            deskripsi: item.deskripsi || item.description || '',
            foto: item.foto || item.photo || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
            kategori: 'minuman' as const,
            // Include additional fields
            id_menu: item.id_menu || item.menu_id,
            id_stan: item.id_stan || item.stall_id,
            discount_name: item.nama_diskon || item.discount_name,
            discount_percentage: item.persentase_diskon || item.discount_percentage,
          })),
        ];

        console.log('📦 Combined Menu:', combinedMenu);
        setMenuItems(combinedMenu);
        setFilteredItems(combinedMenu);
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
            },
            {
              id: 2,
              nama: 'Mie Ayam',
              harga: 20000,
              deskripsi: 'Traditional chicken noodles with savory broth',
              foto: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80',
              kategori: 'makanan',
            },
            {
              id: 3,
              nama: 'Es Teh Manis',
              harga: 5000,
              deskripsi: 'Refreshing sweet iced tea',
              foto: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
              kategori: 'minuman',
            },
            {
              id: 4,
              nama: 'Jus Jeruk',
              harga: 10000,
              deskripsi: 'Fresh orange juice',
              foto: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
              kategori: 'minuman',
            },
          ];
          setMenuItems(mockData);
          setFilteredItems(mockData);
          setError(''); // Clear error, show mock data instead
        } else {
          setError('Gagal memuat menu. Silakan coba lagi.');
          setMenuItems([]);
          setFilteredItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []); // Only fetch once on mount

  // Filter items based on search and category
  useEffect(() => {
    let filtered = menuItems;

    if (activeCategory !== 'all') {
      filtered = filtered.filter((item) => item.kategori === activeCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, activeCategory, menuItems]);

  const handleAddToCart = (item: MenuItem) => {
    // Get current cart from localStorage
    const currentCart = localStorage.getItem('cart');
    let cart: Array<MenuItem & { quantity: number }> = currentCart ? JSON.parse(currentCart) : [];

    // Check if item already in cart
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex > -1) {
      // Increase quantity if already in cart
      cart[existingItemIndex].quantity += 1;
      localStorage.setItem('cart', JSON.stringify(cart));
      alert(`${item.nama} ditambahkan ke keranjang! Jumlah: ${cart[existingItemIndex].quantity}`);
    } else {
      // Add new item to cart
      cart.push({ ...item, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      alert(`${item.nama} ditambahkan ke keranjang!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
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
          {/* Search and Filters */}
          <div className="mb-10 space-y-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search for your favorite dish..."
            />

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
                onClick={() => setActiveCategory('makanan')}
                variant={activeCategory === 'makanan' ? 'primary' : 'outline'}
                size="sm"
              >
                🍔 Food
              </Button>
              <Button
                onClick={() => setActiveCategory('minuman')}
                variant={activeCategory === 'minuman' ? 'primary' : 'outline'}
                size="sm"
              >
                🥤 Beverages
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
              <p className="text-gray-600 text-lg font-semibold">Memuat menu lezat untuk Anda...</p>
              <p className="text-gray-500 text-sm mt-2">Tunggu sebentar ya! 😋</p>
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
                  Waduh! Menu Lagi Istirahat
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 mb-2 text-lg">
                  Menu kami sedang mengalami kendala teknis
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
                    Coba Lagi
                  </Button>
                  <Button 
                    onClick={() => setError('')}
                    variant="outline"
                    size="lg"
                    className="hover:scale-105 transition-transform"
                  >
                    Tutup
                  </Button>
                </div>

                {/* Help Text */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    🍴 <span className="font-semibold">Jangan khawatir!</span> Menu akan segera kembali tersedia
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
                  {searchQuery ? 'Menu Tidak Ditemukan' : 'Menu Kosong'}
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 mb-8 text-lg">
                  {searchQuery 
                    ? (
                      <>
                        Tidak ada menu yang cocok dengan <span className="font-bold text-blue-600">"{searchQuery}"</span>
                        <div className="mt-2 text-sm text-gray-500">Coba kata kunci lain atau pilih kategori berbeda</div>
                      </>
                    )
                    : (
                      <>
                        Belum ada {activeCategory === 'makanan' ? '🍔 makanan' : activeCategory === 'minuman' ? '🥤 minuman' : 'menu'} yang tersedia
                        <div className="mt-2 text-sm text-gray-500">Chef kami sedang menyiapkan menu spesial!</div>
                      </>
                    )
                  }
                </p>

                {/* Suggestions Box */}
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-6 mb-8 border border-blue-100">
                  <div className="text-4xl mb-3">💡</div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Yang bisa kamu coba:</p>
                  <ul className="text-sm text-gray-600 space-y-2 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Ubah kata kunci pencarian</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Pilih kategori "All Menu"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Reset semua filter</span>
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
                    ♻️ Refresh Halaman
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

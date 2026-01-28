'use client';

import { useState, useEffect, useMemo } from 'react';
import { MenuItem, apiClient } from '@/lib/api';
import { MenuCard } from '@/components/MenuCard';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/Button';
import { Sparkles, UtensilsCrossed, Clock, Star } from 'lucide-react';

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [discountMenus, setDiscountMenus] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'makanan' | 'minuman'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        // Fetch menus based on active category ONLY (no search parameter to backend)
        // We'll do filtering on the frontend
        let foodResponse = null;
        let beverageResponse = null;

        if (activeCategory === 'all' || activeCategory === 'makanan') {
          foodResponse = await apiClient.getFoodMenu(''); // Empty search - get all
        }
        
        if (activeCategory === 'all' || activeCategory === 'minuman') {
          beverageResponse = await apiClient.getBeverageMenu(''); // Empty search - get all
        }

        console.log('🍔 Food Response:', foodResponse);
        console.log('🥤 Beverage Response:', beverageResponse);

        // Handle API response structure (may have .data wrapper or direct array)
        const foodData = foodResponse ? (Array.isArray(foodResponse) ? foodResponse : (foodResponse?.data || [])) : [];
        const beverageData = beverageResponse ? (Array.isArray(beverageResponse) ? beverageResponse : (beverageResponse?.data || [])) : [];

        console.log('📊 Processed food data count:', foodData.length);
        console.log('📊 Processed beverage data count:', beverageData.length);
        if (foodData.length > 0) console.log('📋 Sample food item:', foodData[0]);
        if (beverageData.length > 0) console.log('📋 Sample beverage item:', beverageData[0]);

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
        console.log('🔍 Current search query:', debouncedSearchQuery);
        console.log('📂 Active category:', activeCategory);
        setMenuItems(combinedMenu);
        
        // Fetch discount menus (try with or without token)
        try {
          console.log('🏷️ Attempting to fetch discount menus...');
          const headers: any = {
            'makerID': '1',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const discountResponse = await fetch('/api/getmenudiskon', {
            headers: headers,
          });
          
          console.log('🏷️ Discount response status:', discountResponse.status);
          
          if (discountResponse.ok) {
            const discountData = await discountResponse.json();
            console.log('🏷️ Discount data received:', discountData);
            console.log('🏷️ Discount data structure:', {
              hasData: !!discountData?.data,
              isArray: Array.isArray(discountData?.data),
              dataLength: discountData?.data?.length || 0,
            });
            
            // Extract active discounts with menus
            const now = new Date();
            console.log('📅 Current date:', now.toISOString());
            
            const allDiscounts = discountData?.data || [];
            console.log('📋 Total discounts from API:', allDiscounts.length);
            
            const activeDiscounts = allDiscounts.filter((discount: any) => {
              const start = new Date(discount.tanggal_awal);
              const end = new Date(discount.tanggal_akhir);
              const isActive = now >= start && now <= end;
              const hasMenus = discount.menu_diskon && discount.menu_diskon.length > 0;
              
              console.log(`  Discount "${discount.nama_diskon}":`, {
                start: start.toISOString(),
                end: end.toISOString(),
                isActive,
                menuCount: discount.menu_diskon?.length || 0,
                hasMenus,
              });
              
              return isActive && hasMenus;
            });
            
            console.log('✅ Active discounts with menus:', activeDiscounts.length);
            if (activeDiscounts.length > 0) {
              console.log('📋 Active discount details:', activeDiscounts);
            }
            setDiscountMenus(activeDiscounts);
          } else {
            console.error('❌ Failed to fetch discount menus:', discountResponse.status);
          }
        } catch (discountErr) {
          console.error('❌ Error fetching discount menus:', discountErr);
        }
        // Don't set filteredItems here - let the filtering useEffect handle it
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
          // Don't set filteredItems here - let the filtering useEffect handle it
          setError(''); // Clear error, show mock data instead
        } else {
          setError('Gagal memuat menu. Silakan coba lagi.');
          setMenuItems([]);
          // filteredItems will be updated by useEffect
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [activeCategory]); // Only re-fetch when category changes, NOT when search changes

  // Use useMemo for filtering to ensure it always re-calculates when dependencies change
  const filteredItems = useMemo(() => {
    console.log('🔄 useMemo filtering triggered');
    console.log('   menuItems length:', menuItems.length);
    console.log('   debouncedSearchQuery:', debouncedSearchQuery);

    // Log all menu items names
    console.log('   All menu items:', menuItems.map(item => item.nama).join(', '));

    let filtered = menuItems;

    // Apply client-side search filter if search query exists
    if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '') {
      const searchTerm = debouncedSearchQuery.toLowerCase().trim();

      filtered = filtered.filter((item) => {
        const nama = (item.nama || '').toLowerCase();
        const deskripsi = (item.deskripsi || '').toLowerCase();

        // Simple substring match - check if search term appears anywhere in name or description
        const matchesName = nama.includes(searchTerm);
        const matchesDescription = deskripsi.includes(searchTerm);

        console.log(`      Checking "${item.nama}": matches=${matchesName || matchesDescription}`);

        return matchesName || matchesDescription;
      });

      console.log('🔍 Client-side filtering applied (SUBSTRING MATCH).');
      console.log('   Search term:', searchTerm);
      console.log('   Total items before filter:', menuItems.length);
      console.log('   Results after filter:', filtered.length);
      console.log('   Filtered item names:', filtered.map(item => item.nama).join(', '));

      if (filtered.length > 0) {
        console.log('   Sample matched item:', filtered[0].nama);
      } else {
        console.log('   ❌ No items matched the search term');
      }
    } else {
      console.log('✅ No search query - showing all items');
    }

    console.log('📋 Returning filtered items:', filtered.length);
    return filtered;
  }, [menuItems, debouncedSearchQuery]);

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

      {/* Discount Menu Section - Only show if there are active discounts */}
      {discountMenus.length > 0 && !debouncedSearchQuery && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 animate-bounce-slow shadow-lg">
                <Sparkles className="w-5 h-5" />
                <span>SPECIAL DISCOUNT!</span>
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Menu <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Diskon Spesial</span>
              </h2>
              <p className="text-gray-600 text-lg">Hemat hingga puluhan persen untuk menu pilihan!</p>
            </div>

            {discountMenus.map((discount, discountIndex) => (
              <div key={discount.id} className="mb-12">
                <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-white">{discount.persentase_diskon}%</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{discount.nama_diskon}</h3>
                      <p className="text-sm text-gray-600">
                        Berlaku sampai {new Date(discount.tanggal_akhir).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-xl">
                    <p className="text-sm font-semibold text-orange-800">
                      {discount.menu_diskon.length} Menu Tersedia
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {discount.menu_diskon.map((menu: any, menuIndex: number) => {
                    const originalPrice = menu.harga;
                    const discountedPrice = originalPrice - (originalPrice * discount.persentase_diskon / 100);
                    
                    return (
                      <div
                        key={`${menu.id}-${menuIndex}`}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in-up relative"
                        style={{ animationDelay: `${menuIndex * 50}ms` }}
                      >
                        {/* Discount Badge */}
                        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                          -{discount.persentase_diskon}%
                        </div>

                        <div className="relative h-48 bg-gray-200">
                          <img
                            src={`https://ukk-p2.smktelkom-mlg.sch.id/${menu.foto}`}
                            alt={menu.nama_makanan}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
                            }}
                          />
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                            {menu.nama_makanan}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {menu.deskripsi || 'Makanan lezat dan berkualitas'}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs text-gray-500 line-through">
                                Rp {originalPrice.toLocaleString('id-ID')}
                              </p>
                              <p className="text-2xl font-bold text-orange-600">
                                Rp {Math.round(discountedPrice).toLocaleString('id-ID')}
                              </p>
                              <p className="text-xs text-green-600 font-semibold">
                                Hemat Rp {(originalPrice - discountedPrice).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>

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
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
                          >
                            + Keranjang
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Menu Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
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
                  <span>Mencari...</span>
                </div>
              )}
            </div>

            {/* Show search results info */}
            {debouncedSearchQuery && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Menampilkan hasil pencarian untuk: <span className="font-semibold text-blue-600">"{debouncedSearchQuery}"</span>
                  {filteredItems.length > 0 && (
                    <span className="ml-2 text-gray-500">({filteredItems.length} item ditemukan)</span>
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
                  {debouncedSearchQuery ? 'Menu Tidak Ditemukan' : 'Menu Kosong'}
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 mb-8 text-lg">
                  {debouncedSearchQuery 
                    ? (
                      <>
                        Tidak ada menu yang cocok dengan <span className="font-bold text-blue-600">"{debouncedSearchQuery}"</span>
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

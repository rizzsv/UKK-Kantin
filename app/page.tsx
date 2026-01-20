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
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
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
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              error ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Gagal Memuat Menu</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} variant="primary">
                Coba Lagi
              </Button>
            </div>
          ) : <h3 className="text-2xl font-bold text-gray-700 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your search or filter</p>
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

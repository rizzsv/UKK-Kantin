'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface CartItem {
  id: number;
  nama: string;
  harga: number;
  foto: string;
  quantity: number;
}

export default function CartPage() {
  // Mock cart data - replace with actual cart state management
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      nama: 'Nasi Goreng Special',
      harga: 25000,
      foto: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
      quantity: 2,
    },
    {
      id: 3,
      nama: 'Es Teh Manis',
      harga: 5000,
      foto: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
      quantity: 1,
    },
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
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
                        src={item.foto}
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

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span className="font-semibold">Rp {tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <Button variant="primary" size="lg" className="w-full mb-3">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="md" className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Your Cart is Empty</h3>
            <p className="text-gray-500 mb-8">Add some delicious items to get started!</p>
            <Button variant="primary" size="lg">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Menu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

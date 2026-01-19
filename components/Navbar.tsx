'use client';

import Link from 'next/link';
import { ShoppingCart, User, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
              <UtensilsCrossed className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                CanteenHub
              </h1>
              <p className="text-xs text-gray-500 font-medium">Order with Ease</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
            >
              Menu
            </Link>
            <Link
              href="/orders"
              className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
            >
              My Orders
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
            >
              About
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative group">
              <div className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User Profile */}
            <Link href="/profile" className="group">
              <div className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <User className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

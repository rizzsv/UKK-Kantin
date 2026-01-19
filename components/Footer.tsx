'use client';

import Link from 'next/link';
import { UtensilsCrossed, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">CanteenHub</h2>
                <p className="text-xs text-gray-400">Order with Ease</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm">
              Your trusted partner for delicious and convenient canteen food ordering.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>info@canteenhub.com</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>+62 123 4567 8900</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>SMK Telkom Malang, East Java, Indonesia</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-400 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-600 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} CanteenHub. All rights reserved. Built with ❤️ for better canteen experience.
          </p>
        </div>
      </div>
    </footer>
  );
}

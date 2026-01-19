'use client';

import { Button } from '@/components/Button';
import { UtensilsCrossed, Clock, Star, Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Heart className="w-4 h-4" />
            <span>Made with Love & Care</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            About <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">CanteenHub</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for delicious and convenient canteen food ordering. We're committed to providing fresh, quality meals with exceptional service.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Fresh Ingredients</h3>
            <p className="text-gray-600">
              We source only the freshest ingredients to ensure every meal is delicious and nutritious.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Service</h3>
            <p className="text-gray-600">
              Quick and efficient service to get your meals ready when you need them, without the wait.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Quality Guaranteed</h3>
            <p className="text-gray-600">
              Every dish is prepared with care and attention to detail to meet our high quality standards.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl shadow-2xl p-12 text-center text-white mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            To revolutionize canteen dining by providing a seamless ordering experience that saves time, 
            reduces waste, and delivers consistently delicious meals to our community.
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">info@canteenhub.com</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Phone</h3>
              <p className="text-gray-600">+62 123 4567 8900</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
              <p className="text-gray-600">SMK Telkom Malang</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { MenuItem } from '@/lib/api';
import Image from 'next/image';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from './Button';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative h-56 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {item.foto ? (
          <Image
            src={item.foto}
            alt={item.nama}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
            {item.kategori === 'makanan' ? '🍔 Food' : '🥤 Beverage'}
          </span>
        </div>

        {/* Stock Badge */}
        {item.stok !== undefined && (
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
              item.stok > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {item.stok > 0 ? `Stock: ${item.stok}` : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {item.nama}
        </h3>
        
        {item.deskripsi && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
            {item.deskripsi}
          </p>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xs text-gray-500 font-medium">Price</p>
            <p className="text-2xl font-bold text-blue-600">
              Rp {item.harga.toLocaleString('id-ID')}
            </p>
          </div>
          
          <Button
            onClick={() => onAddToCart?.(item)}
            variant="primary"
            size="sm"
            disabled={item.stok === 0}
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

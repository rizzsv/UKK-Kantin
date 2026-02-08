'use client';

import { MenuItem } from '@/lib/api';
import Image from 'next/image';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from './Button';
import { getImageUrl } from '@/lib/utils';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl hover:bg-blue-600 transition-all duration-300 overflow-hidden transform hover:-translate-y-2 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
        <Image
          src={getImageUrl(item.foto)}
          alt={item.nama}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
            item.type === 'food' || item.kategori === 'makanan'
              ? 'bg-orange-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            {item.type === 'food' || item.kategori === 'makanan' ? '🍔 Food' : '🥤 Beverage'}
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
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-white transition-colors">
          {item.nama}
        </h3>

        {item.deskripsi && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow group-hover:text-white">
            {item.deskripsi}
          </p>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 group-hover:border-white/30">
          <div>
            <p className="text-xs text-gray-500 font-medium group-hover:text-white/80">Price</p>
            <p className="text-xl font-bold text-blue-600 group-hover:text-white">
              Rp {item.harga.toLocaleString('id-ID')}
            </p>
          </div>

          <Button
            onClick={() => onAddToCart?.(item)}
            variant="primary"
            size="sm"
            disabled={item.stok === 0}
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Order } from '@/lib/api';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = {
    dikemas: {
      label: 'Being Packaged',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '📦',
    },
    dikirim: {
      label: 'Shipped',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '🚚',
    },
    selesai: {
      label: 'Completed',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '✅',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${config.color} transition-all duration-300 hover:scale-105`}>
      <span className="text-base">{config.icon}</span>
      {config.label}
    </span>
  );
}

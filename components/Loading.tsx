'use client';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-blue-100 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="h-56 bg-gray-200"></div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

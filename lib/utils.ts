/**
 * Utility functions for the CanteenHub application
 */

/**
 * Helper function to convert image URLs from API
 * The API returns relative paths like '/admin/images/...' which need to be converted to full URLs
 * @param foto - The photo URL/path from the API
 * @param useFallback - Whether to return a fallback image if no foto is provided (default: true)
 * @returns Full URL, fallback image URL, or null
 */
export const getImageUrl = (foto: string | null | undefined, useFallback: boolean = true): string | null => {
  // Return fallback image or null if no foto provided
  if (!foto) {
    return useFallback ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' : null;
  }
  
  // If it's already a full URL (starts with http:// or https://), return as is
  if (foto.startsWith('http://') || foto.startsWith('https://')) {
    return foto;
  }
  
  // If it's a relative path, prepend the backend URL
  // Add slash if the path doesn't start with one
  const path = foto.startsWith('/') ? foto : `/${foto}`;
  return `https://ukk-p2.smktelkom-mlg.sch.id${path}`;
};

/**
 * Format currency to Indonesian Rupiah
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

/**
 * Format date to Indonesian locale
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time to Indonesian locale
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

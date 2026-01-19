# 🍽️ CanteenHub - Food Ordering System

A modern, minimalist food ordering website for canteen management built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

- **Clean & Minimalist Design**: Professional blue-gray color scheme with ample white space
- **Responsive Layout**: Fully responsive design that works on all devices
- **Smooth Animations**: Eye-catching animations and transitions for better UX
- **Menu Management**: Browse food and beverage items with search and filtering
- **Order Tracking**: Track orders with status labels (Being Packaged, Shipped, Completed)
- **Shopping Cart**: Add items, adjust quantities, and review before checkout
- **User Profile**: Manage account information and view order history
- **API Integration**: Ready-to-connect with backend API endpoints

## 🎨 Design Highlights

- Bold, easy-to-read typography
- Large appetizing food photos
- Gradient backgrounds with animated blob effects
- Custom scrollbar styling
- Smooth hover effects and transitions
- Professional status badges
- Mobile-first responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
canteenhub/
├── app/
│   ├── about/          # About page
│   ├── cart/           # Shopping cart page
│   ├── orders/         # Order management page
│   ├── profile/        # User profile page
│   ├── layout.tsx      # Root layout with navbar
│   ├── page.tsx        # Homepage with menu display
│   └── globals.css     # Global styles and animations
├── components/
│   ├── Button.tsx      # Reusable button component
│   ├── MenuCard.tsx    # Menu item card component
│   ├── Navbar.tsx      # Navigation bar
│   ├── OrderStatusBadge.tsx  # Order status indicator
│   └── SearchBar.tsx   # Search input component
└── lib/
    ├── api.ts          # API client and types
    └── hooks.ts        # Custom React hooks
```

## 🔌 API Integration

The project is configured to work with the following API base URL:
```
https://ukk-p2.smktelkom-mlg.sch.id/api/
```

### Available Endpoints

#### Menu Management
- `POST /getmenumakanan` - Get food menu
- `POST /getmenuminuman` - Get beverage menu
- `GET /detail_menu/{id}` - Get menu details
- `DELETE /delete_menu/{id}` - Delete menu item

#### Order Management
- `GET /showorder/{status}` - Get orders by status
- `GET /showorderbymonthbysiswa/{date}` - Get orders by month
- `GET /cetaknota/{id}` - Print receipt

#### Student Management
- `POST /tambah_siswa` - Add student
- `POST /update_student/{id}` - Update student

#### Stan Management
- `POST /reg_student` - Register student
- `GET /get_maker` - Get maker data
- `POST /get_all_stan` - Get all stalls

### Authentication

Set your authentication token in the API client:
```typescript
import { apiClient } from '@/lib/api';

apiClient.setToken('your-bearer-token');
apiClient.setMakerID('your-maker-id');
```

## 🎯 Order Status Labels

The system supports three order statuses:
- **📦 Being Packaged** (`dikemas`) - Order is being prepared
- **🚚 Shipped** (`dikirim`) - Order is on the way
- **✅ Completed** (`selesai`) - Order has been delivered

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Image Optimization**: Next.js Image component

## 📱 Pages

### Homepage (/)
- Hero section with animated blobs
- Feature highlights
- Menu grid with search and filters
- Category filtering (All, Food, Beverages)

### Orders (/orders)
- Order list with status filters
- Order details with menu information
- Receipt printing functionality

### Cart (/cart)
- Shopping cart with quantity controls
- Order summary with tax calculation
- Proceed to checkout

### Profile (/profile)
- User information display
- Editable profile fields
- Order statistics

### About (/about)
- Company mission and values
- Feature highlights
- Contact information

## 🎨 Color Palette

- **Primary Blue**: #3B82F6 (blue-600)
- **Dark Blue**: #1E40AF (blue-800)
- **Gray**: #6B7280 (gray-500)
- **Light Gray**: #F9FAFB (gray-50)
- **White**: #FFFFFF

## 📝 Customization

### Changing Colors

Edit the color values in components and Tailwind classes:
- Primary: `blue-600` and `blue-800`
- Secondary: `gray-600` and `gray-700`

### Adding New Menu Items

Update the mock data in `app/page.tsx` or connect to your API:
```typescript
const menuItems = await apiClient.getFoodMenu();
```

## 🚧 Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time order tracking with WebSocket
- [ ] Payment gateway integration
- [ ] Order history with filtering
- [ ] Favorite items feature
- [ ] Push notifications
- [ ] Admin dashboard

## 📄 License

This project is for educational purposes.

## 👨‍💻 Development

Hilmy

---

For questions or support, contact: info@canteenhub.com

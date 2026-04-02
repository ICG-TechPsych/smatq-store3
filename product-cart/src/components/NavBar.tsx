// Navigation bar for user pages with tab switching

import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

interface NavBarProps {
  activeTab: 'products' | 'orders';
}

const NavBar: React.FC<NavBarProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 hidden sm:block">
              SMART<span className="text-blue-600">Q</span>
            </h1>
          </button>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium transition text-sm sm:text-base ${
                activeTab === 'products'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Shop</span>
            </button>
            <button
              onClick={() => navigate('/cart')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium transition text-sm sm:text-base ${
                activeTab === 'orders'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="sm:hidden">Cart</span>
            </button>
          </div>

          {/* Admin Link */}
          <button
            onClick={() => navigate('/admin/login')}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            Admin
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

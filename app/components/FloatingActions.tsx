'use client';

import React from 'react';
import { ShoppingCart, Moon, Sun } from 'lucide-react';
import { useShoppingCart } from 'use-shopping-cart';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';

export default function FloatingActions() {
  const { cartCount = 0 } = useShoppingCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:rotate-12 transition-transform" />
        ) : (
          <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:rotate-12 transition-transform" />
        )}
      </button>

      {/* Cart Button */}
      <Link
        href="/cart"
        className="relative w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110"
      >
        <ShoppingCart className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}

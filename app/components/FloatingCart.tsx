'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useShoppingCart } from 'use-shopping-cart';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function FloatingCart() {
  const { cartCount = 0 } = useShoppingCart();
  const pathname = usePathname();

  // Hide on inventory pages
  if (pathname?.startsWith('/inventory')) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110"
    >
      <ShoppingCart className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </Link>
  );
}

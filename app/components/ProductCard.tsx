'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = product.fakePrice && product.price 
    ? Math.round(((product.fakePrice - product.price) / product.fakePrice) * 100) 
    : null;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-400">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image Container - Shorter, fills width completely */}
        <div className="relative bg-gray-50 dark:bg-gray-900 aspect-[4/3]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
          {discount !== null && (
            <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded shadow-md">
              {discount}%
            </div>
          )}
        </div>

        {/* Content - Very Compact */}
        <div className="p-2 space-y-0.5">
          <h3 className="font-medium text-[11px] text-gray-900 dark:text-white line-clamp-2 leading-tight min-h-7 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              ₦{Math.floor(product.price).toLocaleString()}
            </span>
            {product.fakePrice && (
              <span className="text-[9px] text-gray-400 line-through">
                ₦{Math.floor(product.fakePrice).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Very Compact */}
      <div className="px-2 pb-2">
        <button
          onClick={onAddToCart}
          className="w-full bg-purple-500 hover:bg-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600 text-white text-[11px] font-medium py-1 rounded transition-all duration-200 flex items-center justify-center gap-1 shadow-sm hover:shadow"
        >
          <ShoppingCart className="w-3 h-3" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}

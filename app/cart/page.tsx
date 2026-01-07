'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useShoppingCart } from 'use-shopping-cart';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const {
    cartCount,
    cartDetails,
    removeItem,
    totalPrice,
    incrementItem,
    decrementItem,
  } = useShoppingCart();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-600" />
            Cart ({cartCount})
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {cartCount === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Add some products to get started</p>
            <Link
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
              {Object.values(cartDetails ?? {}).map((entry) => (
                <div key={entry.id} className="flex gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="shrink-0">
                    <div className="h-20 w-20 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src={entry.image as string}
                        alt={entry.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 pr-2">
                        {entry.name}
                      </h3>
                      <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        ₦{entry.price.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900">
                          <button
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            onClick={() => decrementItem(entry.id)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-white min-w-8 text-center border-x border-gray-300 dark:border-gray-600">
                            {entry.quantity}
                          </span>
                          <button
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            onClick={() => incrementItem(entry.id)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(entry.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Checkout */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-4">
                <p>Total:</p>
                <p>₦{(totalPrice ?? 0).toLocaleString()}</p>
              </div>

              <Link
                href={`/checkout?totalPrice=${totalPrice ?? 0}`}
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

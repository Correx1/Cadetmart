'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Home } from 'lucide-react';
import { useShoppingCart } from 'use-shopping-cart';
import Link from 'next/link';

function SuccessPageContent() {
  const { clearCart } = useShoppingCart();
  const searchParams = useSearchParams();
  
  const rawStatus = searchParams.get('status') || '';
  const tx_ref = searchParams.get('tx_ref') || searchParams.get('txRef');
  
  const isSuccessful = ['successful', 'completed'].includes(rawStatus.toLowerCase());
  const [hasCleared, setHasCleared] = useState(false);

  useEffect(() => {
    if (isSuccessful && !hasCleared) {
      clearCart();
      setHasCleared(true);
      
      // Clear pending order data
      localStorage.removeItem('pendingOrderData');
    }
  }, [isSuccessful, clearCart, hasCleared]);

  if (!isSuccessful) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your payment was not successful. Please try again.
          </p>
          <Link
            href="/cart"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Thank you for your purchase
        </p>
        
        {tx_ref && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Order Number: <span className="font-mono font-semibold">{tx_ref}</span>
          </p>
        )}

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your order has been confirmed. You will receive an email with your order details and download links shortly.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4 inline mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

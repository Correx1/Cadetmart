/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from 'use-shopping-cart';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from 'sonner';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CartProvider
          mode="payment"
          cartMode="client-only"
          stripe={process.env.NEXT_PUBLIC_STRIPE_KEY as string}
          successUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/success`}
          cancelUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/`}
          currency="NGN"
          billingAddressCollection={false}
          shouldPersist={true}
        >
          {children}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            theme="dark"
          />
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

'use client';

import React from 'react';
import { useShoppingCart } from 'use-shopping-cart';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartProps {
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

export default function AddToCart({ product }: AddToCartProps) {
  const { addItem } = useShoppingCart();

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      currency: 'NGN',
      image: product.imageUrl,
    });

    toast.success(`${product.name} added to cart!`, {
      duration: 2000,
      position: 'top-center',
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-purple-500 hover:bg-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow"
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Cart
    </button>
  );
}

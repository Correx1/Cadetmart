import React from 'react';
import Link from 'next/link';
import { client } from '@/app/lib/sanity';
import { Product } from '@/app/types';
import { ArrowLeft, Star } from 'lucide-react';
import ImageGallery from '@/app/components/ImageGallery';
import AddToCart from '@/app/components/AddToCart';
import Footer from '@/app/components/Footer';

const transactionFeeRate = 0.06;
const vatRate = 0.075;

function applyVatLogic(product: any) {
  const originalPrice = product.price ?? 0;
  const transactionFee = originalPrice * transactionFeeRate;
  const vatOnFee = transactionFee * vatRate;
  const vatTotal = transactionFee + vatOnFee;
  const grandPrice = originalPrice + vatTotal;
  return { ...product, price: grandPrice };
}

async function getData(slug: string) {
  
  const query = `*[_type == "product" 
    && slug.current == $slug
    && defined(_id)
    && defined(name)
    && defined(price)
    && defined(description)
    && count(images) > 0
    && defined(images[0].asset)
  ][0] {
    _id,
    images[] {
      asset-> {
        url
      }
    },
    price,
    fakePrice,
    name,
    description,
    "slug": slug.current,
    "categoryName": category->name
  }`;

  try {
    const data = await client.fetch(query, { slug });
    
    if (!data) {
      return null;
    }
    
    return applyVatLogic(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getData(slug);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <h1 className="text-6xl font-bold text-purple-500 dark:text-purple-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The product "{slug}" doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = data.fakePrice && data.price 
    ? Math.round(((data.fakePrice - data.price) / data.fakePrice) * 100) 
    : null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 lg:px-8 py-3">
        <div className="max-w-5xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Products</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
              <ImageGallery images={data.images} />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Category */}
              {data.categoryName && (
                <span className="inline-block text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded mb-3">
                  {data.categoryName}
                </span>
              )}

              {/* Product Name */}
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white capitalize mb-3">
                {data.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500 dark:bg-purple-500 rounded">
                  <Star className="h-3.5 w-3.5 text-white fill-white" />
                  <span className="text-xs font-semibold text-white">4.2</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  ₦{data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {data.fakePrice && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      ₦{data.fakePrice.toLocaleString()}
                    </span>
                    {discount && (
                      <span className="px-2 py-0.5 bg-purple-500 dark:bg-purple-500 text-white rounded text-xs font-semibold">
                        {discount}% off
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {data.description}
                </p>
              </div>

              {/* Add to Cart Button - Smaller */}
              <div className="pt-2">
                <AddToCart 
                  product={{
                    _id: data._id,
                    name: data.name,
                    price: data.price,
                    imageUrl: data.images[0].asset.url
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

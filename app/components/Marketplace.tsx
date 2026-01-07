'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { client } from '../lib/sanity';
import { Product } from '../types';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import { useShoppingCart } from 'use-shopping-cart';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebounce } from 'use-debounce';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

// VAT logic
const transactionFeeRate = 0.06;
const vatRate = 0.075;

const applyVatLogic = (product: Product): Product => {
  const base = product.price ?? 0;
  const fee = base * transactionFeeRate;
  const vat = fee * vatRate;
  return { ...product, price: base + fee + vat };
};

// Validation
const isValidProduct = (product: unknown): boolean => {
  if (!product || typeof product !== 'object') return false;
  const p = product as Record<string, unknown>;
  return Boolean(
    p._id &&
    p.name &&
    p.slug &&
    p.price &&
    p.imageUrl &&
    p.description
  );
};

// Fetch categories from Sanity
async function getCategories(): Promise<{ label: string; value: string | undefined }[]> {
  const query = `*[_type == "category"] | order(name asc) {
    name,
    "slug": slug.current
  }`;

  try {
    const data = await client.fetch(query);
    const categories = [
      { label: 'All Categories', value: undefined },
      ...data.map((cat: any) => ({ label: cat.name, value: cat.name }))
    ];
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [{ label: 'All Categories', value: undefined }];
  }
}

// Fetch products
async function getData(skip: number, category: string | undefined): Promise<Product[]> {
  const categoryFilter = category ? `&& category->name == "${category}"` : '';
  
  const query = `*[_type == "product" 
    && defined(_id)
    && defined(name)
    && defined(slug.current)
    && defined(price)
    && defined(description)
    && count(images) > 0
    && defined(images[0].asset->url)
    ${categoryFilter}
  ] | order(_createdAt desc) [${skip}...${skip + 12}] {
    _id,
    price,
    fakePrice,
    name,
    description,
    "slug": slug.current,
    "categoryName": category->name,
    "imageUrl": images[0].asset->url
  }`;

  try {
    const data = await client.fetch(query);
    if (!Array.isArray(data)) return [];
    
    const validProducts = data.filter(isValidProduct);
    const productsWithVat = validProducts.map(applyVatLogic);
    
    // Shuffle products using Fisher-Yates algorithm for random display
    const shuffled = [...productsWithVat];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Search products
async function searchData(queryStr: string, skip: number): Promise<Product[]> {
  const query = `*[_type == "product" 
    && name match "*${queryStr}*"
    && defined(_id)
    && defined(name)
    && defined(slug.current)
    && defined(price)
    && defined(description)
    && count(images) > 0
    && defined(images[0].asset->url)
  ] | order(_createdAt desc) [${skip}...${skip + 10}] {
    _id,
    price,
    fakePrice,
    name,
    description,
    "slug": slug.current,
    "categoryName": category->name,
    "imageUrl": images[0].asset->url
  }`;

  try {
    const data = await client.fetch(query);
    if (!Array.isArray(data)) return [];
    
    const validProducts = data.filter(isValidProduct);
    return validProducts.map(applyVatLogic);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

export default function Marketplace() {
  const { addItem } = useShoppingCart();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: string | undefined }[]>([{ label: 'All Categories', value: undefined }]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setSkip(0);
    setData([]);
    setHasMore(true);
    setIsSearching(Boolean(debouncedQuery.trim()));
    setIsInitialLoading(true);
  }, [debouncedQuery, selectedCategory]);

  const fetchMoreData = useCallback(() => {
    setSkip((prev) => prev + 10);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const newData = isSearching
        ? await searchData(debouncedQuery, skip)
        : await getData(skip, selectedCategory);

      if (newData.length === 0) {
        setHasMore(false);
        setIsInitialLoading(false);
        return;
      }

      setData((prev) => {
        const ids = new Set(prev.map((x) => x._id));
        const unique = newData.filter((x) => !ids.has(x._id));
        return [...prev, ...unique];
      });
      
      setIsInitialLoading(false);
    };
    fetch();
  }, [skip, selectedCategory, isSearching, debouncedQuery]);

  const handleCategoryClick = (cat: string | undefined) => {
    setSelectedCategory(cat);
    setSearchQuery('');
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      currency: 'NGN',
      image: product.imageUrl,
    });
    
    // Show toast notification
    toast.success(`${product.name} added to cart!`, {
      duration: 2000,
      position: 'top-center',
    });
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-950 overflow-x-hidden mb-16 min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-800 shadow-sm">
        {/* Logo and Theme Toggle */}
        <div className="px-4 sm:px-6 md:px-8 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 dark:bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Cadet<span className="text-purple-500 dark:text-purple-400">Mart</span>
              </h1>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <SearchBar onSearch={setSearchQuery} placeholder="Search products..." />
        
        <div className="px-4 sm:px-6 md:px-8 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-[1600px] mx-auto">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryClick}
            />
          </div>
        </div>
      </div>

      <div className="pt-44 sm:pt-48 px-4 sm:px-6 md:px-8">
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMoreData}
          hasMore={hasMore}
          scrollThreshold={0.9}
          loader={
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 max-w-[1600px] mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
          endMessage={
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {data.length === 0 ? 'No products found' : 'No more products'}
            </p>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 max-w-[1600px] mx-auto">
            {isInitialLoading
              ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : data.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
}

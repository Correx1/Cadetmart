'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CategoryFilterProps {
  categories: { label: string; value: string | undefined }[];
  selectedCategory: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = categories.find((c) => c.value === selectedCategory)?.label || 'All Categories';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string | undefined) => {
    onCategoryChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:border-purple-400 dark:hover:border-purple-500 transition-colors text-sm"
      >
        <span className="font-medium text-gray-700 dark:text-gray-300">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => handleSelect(category.value)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                selectedCategory === category.value
                  ? 'bg-purple-600 text-white font-medium'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

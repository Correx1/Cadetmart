'use client';

import React, { useEffect, useState } from 'react';
import { Search, Package, TrendingUp, AlertTriangle, TrendingDown, Loader2, Download } from 'lucide-react';

interface StockAddition {
  quantityAdded: number;
  dateAdded: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  sales: number;
  categoryName?: string;
  stockAdditions?: StockAddition[];
  remarks?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [outOfStockFilter, setOutOfStockFilter] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory/list');
      const data = await res.json();
      
      if (data.products) {
        setProducts(data.products);
        setFilteredProducts(data.products);
        
        // Extract all unique dates
        const dates = new Set<string>();
        data.products.forEach((product: Product) => {
          product.stockAdditions?.forEach((addition) => {
            dates.add(addition.dateAdded);
          });
        });
        setAllDates(Array.from(dates).sort());
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (product: Product) => {
    const additionsTotal = product.stockAdditions?.reduce(
      (sum, addition) => sum + addition.quantityAdded,
      0
    ) || 0;
    return product.quantity + additionsTotal;
  };

  const calculateRemaining = (product: Product) => {
    return calculateTotal(product) - product.sales;
  };

  const getQuantityForDate = (product: Product, date: string) => {
    const addition = product.stockAdditions?.find(a => a.dateAdded === date);
    return addition ? addition.quantityAdded : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter products
  useEffect(() => {
    let filtered = products;
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (lowStockFilter) {
      filtered = filtered.filter(p => {
        const remaining = calculateRemaining(p);
        return remaining <= 5 && remaining > 0;
      });
    }
    
    if (outOfStockFilter) {
      filtered = filtered.filter(p => {
        const remaining = calculateRemaining(p);
        return remaining <= 0;
      });
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, products, lowStockFilter, outOfStockFilter]);

  // Calculate summary statistics
  const totalProducts = products.length;
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
  const lowStockCount = products.filter(p => {
    const remaining = calculateRemaining(p);
    return remaining <= 5 && remaining > 0;
  }).length;
  const outOfStockCount = products.filter(p => {
    const remaining = calculateRemaining(p);
    return remaining <= 0;
  }).length;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/inventory/export');
      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cadetmart-inventory-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export inventory');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => {
            setLowStockFilter(false);
            setOutOfStockFilter(false);
          }}
          className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer ${
            !lowStockFilter && !outOfStockFilter ? 'ring-4 ring-purple-500' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{totalProducts}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Products</h3>
          <p className="text-xs opacity-75 mt-1">All inventory items</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalSales}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Sales</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Units sold</p>
        </div>

        <div 
          onClick={() => {
            setLowStockFilter(!lowStockFilter);
            setOutOfStockFilter(false);
          }}
          className={`bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${lowStockFilter ? 'ring-4 ring-purple-500' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{lowStockCount}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Alert</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">≤ 5 remaining {lowStockFilter && '(filtered)'}</p>
        </div>

        <div 
          onClick={() => {
            setOutOfStockFilter(!outOfStockFilter);
            setLowStockFilter(false);
          }}
          className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer ${outOfStockFilter ? 'ring-4 ring-purple-300' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{outOfStockCount}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Out of Stock</h3>
          <p className="text-xs opacity-75 mt-1">0 remaining {outOfStockFilter && '(filtered)'}</p>
        </div>
      </div>

      {/* Search and Export */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Excel
              </>
            )}
          </button>
        </div>
        {(searchQuery || lowStockFilter || outOfStockFilter) && (
          <div className="flex gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
            {searchQuery && (
              <span>Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</span>
            )}
            {lowStockFilter && (
              <button onClick={() => setLowStockFilter(false)} className="text-purple-600 hover:text-purple-700 font-medium">
                ✕ Clear low stock filter
              </button>
            )}
            {outOfStockFilter && (
              <button onClick={() => setOutOfStockFilter(false)} className="text-purple-600 hover:text-purple-700 font-medium">
                ✕ Clear out of stock filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">Product</th>
                <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">Quantity</th>
                
                {/* Dynamic date columns */}
                {allDates.map((date) => (
                  <th key={date} className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                    Added {formatDate(date)}
                  </th>
                ))}
                
                <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">Total</th>
                <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">Sales</th>
                <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">Remaining</th>
                <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7 + allDates.length} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No products found matching your search' : 'No products found'}
                  </td>
                </tr>
              ) : (
                (() => {
                  const groupedProducts: { [key: string]: Product[] } = {};
                  filteredProducts.forEach(product => {
                    const category = product.categoryName || 'Uncategorized';
                    if (!groupedProducts[category]) {
                      groupedProducts[category] = [];
                    }
                    groupedProducts[category].push(product);
                  });

                  return Object.entries(groupedProducts).map(([category, products], categoryIndex) => (
                    <React.Fragment key={category}>
                      <tr className="bg-gradient-to-r from-gray-800 to-gray-700">
                        <td colSpan={7 + allDates.length} className="px-4 py-3">
                          <h3 className="text-white font-bold text-lg uppercase tracking-wide">
                            {category}
                          </h3>
                        </td>
                      </tr>
                      
                      {products.map((product, index) => {
                        const total = calculateTotal(product);
                        const remaining = calculateRemaining(product);
                        
                        return (
                          <tr key={product._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                            <td className="px-4 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{product.name}</td>
                            <td className="px-4 py-4 text-center text-gray-700 dark:text-gray-300">{product.quantity}</td>
                            
                            {/* Dynamic date columns */}
                            {allDates.map((date) => {
                              const qty = getQuantityForDate(product, date);
                              return (
                                <td key={date} className="px-4 py-4 text-center">
                                  {qty !== null ? (
                                    <span className="text-green-600 font-medium">+{qty}</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            })}
                            
                            <td className="px-4 py-4 text-center font-semibold text-blue-600">{total}</td>
                            <td className="px-4 py-4 text-center font-medium text-orange-600">{product.sales}</td>
                            <td className="px-4 py-4 text-center whitespace-nowrap">
                              <span className={`px-3 py-1.5 rounded-full text-sm font-bold inline-block ${
                                remaining > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                                remaining > 5 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                remaining > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 
                                remaining === 0 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {remaining}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-gray-600 dark:text-gray-400 text-sm">
                              {product.remarks || '-'}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {categoryIndex < Object.keys(groupedProducts).length - 1 && (
                        <tr className="bg-gray-100 dark:bg-gray-900">
                          <td colSpan={7 + allDates.length} className="h-4"></td>
                        </tr>
                      )}
                    </React.Fragment>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

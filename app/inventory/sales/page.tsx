'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  sales: number;
  stockAdditions?: { quantityAdded: number; dateAdded: string }[];
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory/list');
      const data = await res.json();
      
      if (data.products) {
        setProducts(data.products);
        setFilteredProducts(data.products.filter((p: Product) => p.sales > 0));
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSales = (product: Product) => {
    return product.price * product.sales;
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

  const grandTotalUnits = filteredProducts.reduce((sum, p) => sum + p.sales, 0);
  const grandTotalRevenue = filteredProducts.reduce((sum, p) => sum + calculateTotalSales(p), 0);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Sales Report</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Summary of sales and revenue</p>
          </div>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/inventory/export-sales');
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (error) {
                console.error('Error exporting:', error);
              }
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            Export Excel
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Sales (Units)</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Price</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Total Sales</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No sales recorded yet
                  </td>
                </tr>
              ) : (
                <>
                  {filteredProducts.map((product, index) => {
                    const totalSales = calculateTotalSales(product);
                    const remaining = calculateRemaining(product);
                    
                    return (
                      <tr key={product._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                        <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{product.sales}</td>
                        <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-purple-600 dark:text-purple-400">
                          {formatCurrency(totalSales)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-medium ${
                            remaining > 10 ? 'text-green-600' : 
                            remaining > 0 ? 'text-yellow-600' : 
                            remaining === 0 ? 'text-gray-600' :
                            'text-red-600'
                          }`}>
                            {remaining}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Totals Row */}
                  <tr className="bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 font-bold sticky bottom-0">
                    <td className="px-6 py-4 text-gray-900 dark:text-white">TOTAL</td>
                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{grandTotalUnits}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white">-</td>
                    <td className="px-6 py-4 text-right text-purple-700 dark:text-purple-400 text-lg">
                      {formatCurrency(grandTotalRevenue)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white">-</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

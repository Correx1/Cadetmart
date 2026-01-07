'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, X, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  todaySales: number;
  totalCustomers: number;
}

interface Order {
  order_number: string;
  person_name: string;
  total_price: number;
  created_at: string;
  order_status: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  sales: number;
  stockAdditions?: { quantityAdded: number; dateAdded: string }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStockValueModal, setShowStockValueModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();
      
      // Calculate today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersRes = await fetch('/api/orders/list');
      const ordersData = await ordersRes.json();
      const allOrders = ordersData.orders || [];
      
      const todayOrders = allOrders.filter((order: Order) => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
      
      const todaySales = todayOrders.reduce((sum: number, order: Order) => sum + order.total_price, 0);
      
      setStats({
        ...statsData,
        todaySales
      });
      
      setRecentOrders(allOrders.slice(0, 5));

      // Fetch products for stock value
      const productsRes = await fetch('/api/inventory/list');
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const stockValue = products.reduce((sum, p) => {
    const remaining = calculateRemaining(p);
    return sum + (remaining * p.price);
  }, 0);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      description: 'from last month'
    },
    {
      title: 'Total Orders',
      value: (stats?.totalOrders || 0).toString(),
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
      description: 'from last month'
    },
    {
      title: 'Stock Value',
      value: formatCurrency(stockValue),
      icon: Package,
      trend: '-2.4%',
      trendUp: false,
      description: 'from last month',
      onClick: () => setShowStockValueModal(true),
      clickable: true
    },
    {
      title: 'Today Sales',
      value: formatCurrency(stats?.todaySales || 0),
      icon: TrendingUp,
      trend: '+15.3%',
      trendUp: true,
      description: 'from yesterday'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              onClick={card.onClick}
              className={`group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                card.clickable ? 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-600' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {card.value}
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      card.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {card.trendUp ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {card.trend}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {card.description}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
              </div>
              {card.clickable && (
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-400">Click for details →</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest customer transactions</p>
          </div>
          <Link
            href="/inventory/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.order_number} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {order.person_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">
                      ₦{order.total_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.order_status === 'successful' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-900'
                          : order.order_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Value Modal */}
      {showStockValueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStockValueModal(false)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Value Breakdown</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total: {formatCurrency(stockValue)}</p>
                </div>
                <button 
                  onClick={() => setShowStockValueModal(false)} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remaining</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {products
                    .map(p => ({
                      ...p,
                      remaining: calculateRemaining(p),
                      value: calculateRemaining(p) * p.price
                    }))
                    .filter(p => p.remaining > 0)
                    .sort((a, b) => b.value - a.value)
                    .map((product, index) => (
                      <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.name}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">{product.remaining}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">₦{product.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">₦{product.value.toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

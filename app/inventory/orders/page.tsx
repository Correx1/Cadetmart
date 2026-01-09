'use client';

import React, { useEffect, useState } from 'react';
import { Search, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  order_number: string;
  person_name: string;
  email: string;
  phone: string;
  location: string;
  shoe_size: string;
  clothing_size: string;
  items: string;
  total_price: number;
  transaction_id: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  id: number;
}

// Accordion component for order items
function OrderItemsAccordion({ items }: { items: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemCount = items.length;

  if (itemCount === 0) {
    return <span className="text-xs text-gray-500">No items</span>;
  }

  // Show first 2 items by default
  const displayItems = isExpanded ? items : items.slice(0, 2);
  const hasMore = itemCount > 2;

  return (
    <div className="max-w-xs">
      <div className="space-y-1">
        {displayItems.map((item: any, idx: number) => (
          <div key={idx} className="text-xs text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{item.quantity} </span> {item.name}
          </div>
        ))}
      </div>
      
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Show {itemCount - 2} more
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Dropdown component for order status
function OrderStatusDropdown({ 
  orderId, 
  currentStatus, 
  onStatusChange 
}: { 
  orderId: number; 
  currentStatus: string; 
  onStatusChange: (status: string) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    { value: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    { value: 'Returned', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
    { value: 'Refunded', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        onStatusChange(newStatus);
      } else {
        console.error('Failed to update status');
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer transition-colors ${currentOption.color} ${
        isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
      }`}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.value}
        </option>
      ))}
    </select>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/list');
      const data = await res.json();
      
      if (data.orders) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = orders.filter(order =>
        order.order_number.toLowerCase().includes(query) ||
        order.person_name.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.phone.includes(query)
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const parseItems = (itemsString: string) => {
    try {
      return JSON.parse(itemsString);
    } catch {
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 md:p-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No orders found' : 'No orders yet'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const itemsArray = parseItems(order.items);
            const itemCount = itemsArray.length;
            
            return (
              <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-mono text-purple-600 dark:text-purple-400">#{order.order_number}</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{order.person_name}</p>
                  </div>
                  {/* Status Dropdown for Mobile */}
                  <OrderStatusDropdown
                    orderId={order.id}
                    currentStatus={order.order_status}
                    onStatusChange={(newStatus) => {
                      setOrders(orders.map(o => 
                        o.id === order.id ? { ...o, order_status: newStatus } : o
                      ));
                    }}
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₦{order.total_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-900 dark:text-white text-xs">{order.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <span className="text-gray-900 dark:text-white text-xs">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Payment:</span>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      order.payment_status === 'successful' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                  {(order.shoe_size || order.clothing_size) && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Size:</span>
                      <span className="text-gray-900 dark:text-white text-xs">
                        {[order.shoe_size && `Shoe: ${order.shoe_size}`, order.clothing_size && `Clothing: ${order.clothing_size}`].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {itemCount > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Items:</p>
                      {/* Show all items with accordion */}
                      <OrderItemsAccordion items={itemsArray} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-24">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Shoe Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Clothing Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-64">Items</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <FileText className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'No orders found' : 'No orders yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemsArray = parseItems(order.items);
                  const itemCount = itemsArray.length;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-mono text-purple-600 dark:text-purple-400">
                        #{order.order_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.person_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate">
                        {order.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {order.phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {order.location || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {order.shoe_size || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {order.clothing_size || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <OrderItemsAccordion items={itemsArray} />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                        ₦{order.total_price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.payment_status === 'successful' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <OrderStatusDropdown 
                          orderId={order.id}
                          currentStatus={order.order_status}
                          onStatusChange={(newStatus) => {
                            // Update the order status in state
                            setOrders(orders.map(o => 
                              o.id === order.id ? { ...o, order_status: newStatus } : o
                            ));
                            setFilteredOrders(filteredOrders.map(o => 
                              o.id === order.id ? { ...o, order_status: newStatus } : o
                            ));
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

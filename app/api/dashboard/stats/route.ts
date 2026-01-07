import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
  try {
    // Get all orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate stats
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
    const totalOrders = orders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers (by email)
    const uniqueCustomers = new Set(orders?.map(o => o.email) || []).size;

    // Calculate percentage changes (compare last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30Days = orders?.filter(o => new Date(o.created_at) >= thirtyDaysAgo) || [];
    const previous30Days = orders?.filter(o => {
      const date = new Date(o.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }) || [];

    const last30Revenue = last30Days.reduce((sum, o) => sum + Number(o.total_price), 0);
    const prev30Revenue = previous30Days.reduce((sum, o) => sum + Number(o.total_price), 0);
    const revenueChange = prev30Revenue > 0 ? ((last30Revenue - prev30Revenue) / prev30Revenue) * 100 : 0;

    const ordersChange = previous30Days.length > 0 
      ? ((last30Days.length - previous30Days.length) / previous30Days.length) * 100 
      : 0;

    const last30Avg = last30Days.length > 0 ? last30Revenue / last30Days.length : 0;
    const prev30Avg = previous30Days.length > 0 ? prev30Revenue / previous30Days.length : 0;
    const avgChange = prev30Avg > 0 ? ((last30Avg - prev30Avg) / prev30Avg) * 100 : 0;

    const last30Customers = new Set(last30Days.map(o => o.email)).size;
    const prev30Customers = new Set(previous30Days.map(o => o.email)).size;
    const customersChange = prev30Customers > 0 
      ? ((last30Customers - prev30Customers) / prev30Customers) * 100 
      : 0;

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalCustomers: uniqueCustomers,
      changes: {
        revenue: revenueChange,
        orders: ordersChange,
        avgOrder: avgChange,
        customers: customersChange
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

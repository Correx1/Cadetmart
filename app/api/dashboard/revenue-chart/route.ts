import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
  try {
    // Get orders from last 60 days for chart
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, total_price')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const dailyRevenue: { [key: string]: number } = {};
    
    orders?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(order.total_price);
    });

    // Convert to array format for chart
    const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue
    }));

    return NextResponse.json({ data: chartData });
  } catch (error) {
    console.error('Revenue chart error:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
  }
}

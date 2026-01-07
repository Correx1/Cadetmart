import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  // Check authentication
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

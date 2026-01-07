import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth';
import { orderStatusUpdateSchema } from '@/lib/validations/order';
import { ZodError } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // Check authentication
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate input with Zod
    const validated = orderStatusUpdateSchema.parse(body);

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ order_status: validated.status })
      .eq('id', validated.orderId);

    if (error) {
      console.error('❌ Supabase error updating order status:', error);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    console.error('Error in update-status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

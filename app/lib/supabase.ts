import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Type for order data
export interface OrderData {
  order_number: string;
  person_name: string;
  email: string;
  phone: string;
  location: string;
  items: string;
  total_price: number;
  transaction_id: string;
  payment_status: string;
  order_date?: string;
}

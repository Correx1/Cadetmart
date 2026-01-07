import { z } from 'zod';

// Order validation schema
export const orderSchema = z.object({
  person_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .regex(/^\+?[0-9]{10,15}$/, 'Phone number must be 10-15 digits, optionally starting with +')
    .trim(),
  
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be less than 200 characters')
    .trim(),
  
  items: z.string()
    .min(1, 'Items are required')
    .max(5000, 'Items data too large'),
  
  total_price: z.number()
    .positive('Total price must be positive')
    .finite('Total price must be a valid number')
    .max(10000000, 'Total price exceeds maximum allowed'),
  
  transaction_id: z.string()
    .min(1, 'Transaction ID is required')
    .max(255, 'Transaction ID too long')
    .trim(),
  
  payment_status: z.enum(['successful', 'pending', 'failed']),
  
  order_status: z.enum(['Confirmed', 'Delivered', 'Returned', 'Refunded']).default('Confirmed'),
});

export type OrderInput = z.infer<typeof orderSchema>;

// Order status update schema
export const orderStatusUpdateSchema = z.object({
  orderId: z.string()
    .min(1, 'Order ID is required'),
  
  status: z.enum(['Confirmed', 'Delivered', 'Returned', 'Refunded']),
});

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;

// Search query validation
export const searchQuerySchema = z.string()
  .max(200, 'Search query too long')
  .trim()
  .transform(val => val.replace(/[<>]/g, '')); // Remove potential XSS characters

// Pagination validation
export const paginationSchema = z.object({
  skip: z.number()
    .int('Skip must be an integer')
    .min(0, 'Skip must be non-negative')
    .max(10000, 'Skip value too large')
    .default(0),
  
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

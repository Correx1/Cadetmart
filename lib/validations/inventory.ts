import { z } from 'zod';

// Inventory product validation
export const inventoryProductSchema = z.object({
  productId: z.string()
    .min(1, 'Product ID is required')
    .max(100, 'Product ID too long')
    .trim(),
  
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative')
    .max(1000000, 'Quantity exceeds maximum'),
  
  price: z.number()
    .positive('Price must be positive')
    .finite('Price must be a valid number')
    .max(10000000, 'Price exceeds maximum'),
});

// Stock addition validation
export const stockAdditionSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .max(1000000, 'Quantity exceeds maximum'),
  
  remarks: z.string()
    .max(500, 'Remarks must be less than 500 characters')
    .trim()
    .optional(),
});

// Sales update validation
export const salesUpdateSchema = z.object({
  productId: z.string()
    .min(1, 'Product ID is required')
    .max(100, 'Product ID too long')
    .trim(),
  
  quantitySold: z.number()
    .int('Quantity sold must be an integer')
    .positive('Quantity sold must be positive')
    .max(1000000, 'Quantity sold exceeds maximum'),
  
  saleDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

export type InventoryProduct = z.infer<typeof inventoryProductSchema>;
export type StockAddition = z.infer<typeof stockAdditionSchema>;
export type SalesUpdate = z.infer<typeof salesUpdateSchema>;

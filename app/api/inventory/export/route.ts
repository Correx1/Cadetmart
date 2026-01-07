import { NextResponse } from 'next/server';
import { adminClient } from '@/app/lib/sanity';
import { requireAuth } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET() {
  // Check authentication
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    // Fetch all products
    const products = await adminClient.fetch(`
      *[_type == "product"] | order(category->name asc, name asc) {
        _id,
        name,
        price,
        quantity,
        sales,
        remarks,
        "categoryName": category->name,
        stockAdditions[] {
          quantityAdded,
          dateAdded
        }
      }
    `);

    // Prepare data for Excel
    const inventoryData = products.map((product: any) => {
      const additionsTotal = product.stockAdditions?.reduce(
        (sum: number, addition: any) => sum + addition.quantityAdded,
        0
      ) || 0;
      const total = product.quantity + additionsTotal;
      const remaining = total - product.sales;
      const stockValue = remaining * product.price;

      return {
        Category: product.categoryName || 'Uncategorized',
        Product: product.name,
        'Initial Qty': product.quantity,
        'Stock Added': additionsTotal,
        'Total Stock': total,
        Sales: product.sales,
        Remaining: remaining,
        'Unit Price': product.price,
        'Stock Value': stockValue,
        Remarks: product.remarks || '',
      };
    });

    // Calculate totals
    const totals = {
      Category: '',
      Product: 'TOTAL',
      'Initial Qty': inventoryData.reduce((sum: number, row: any) => sum + row['Initial Qty'], 0),
      'Stock Added': inventoryData.reduce((sum: number, row: any) => sum + row['Stock Added'], 0),
      'Total Stock': inventoryData.reduce((sum: number, row: any) => sum + row['Total Stock'], 0),
      Sales: inventoryData.reduce((sum: number, row: any) => sum + row.Sales, 0),
      Remaining: inventoryData.reduce((sum: number, row: any) => sum + row.Remaining, 0),
      'Unit Price': '',
      'Stock Value': inventoryData.reduce((sum: number, row: any) => sum + row['Stock Value'], 0),
      Remarks: '',
    };

    inventoryData.push(totals);

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(inventoryData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Category
      { wch: 25 }, // Product
      { wch: 12 }, // Initial Qty
      { wch: 12 }, // Stock Added
      { wch: 12 }, // Total Stock
      { wch: 10 }, // Sales
      { wch: 12 }, // Remaining
      { wch: 12 }, // Unit Price
      { wch: 15 }, // Stock Value
      { wch: 30 }, // Remarks
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=cadetmart-inventory-${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    });

  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}

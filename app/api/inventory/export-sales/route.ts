import { NextResponse } from 'next/server';
import { adminClient } from '@/app/lib/sanity';
import { requireAuth } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET() {
  // Check authentication
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    // Fetch products
    const products = await adminClient.fetch(`
      *[_type == "product"] | order(name asc) {
        _id,
        name,
        price,
        quantity,
        sales,
        stockAdditions[] {
          quantityAdded,
          dateAdded
        }
      }
    `);

    // Filter products with sales > 0 only
    const productsWithSales = products.filter((product: any) => product.sales > 0);

    // Calculate totals for each product
    const reportData = productsWithSales.map((product: any) => {
      const additionsTotal = product.stockAdditions?.reduce(
        (sum: number, addition: any) => sum + addition.quantityAdded,
        0
      ) || 0;
      const total = product.quantity + additionsTotal;
      const remaining = total - product.sales;
      const totalSales = product.price * product.sales;

      return {
        Product: product.name,
        Sales: product.sales,
        Price: product.price,
        'Total Sales': totalSales,
        Remaining: remaining,
      };
    });

    // Calculate grand totals
    const grandTotalSales = reportData.reduce((sum: number, row: any) => sum + row.Sales, 0);
    const grandTotalRevenue = reportData.reduce((sum: number, row: any) => sum + row['Total Sales'], 0);

    // Add totals row
    reportData.push({
      Product: 'TOTAL',
      Sales: grandTotalSales,
      Price: '',
      'Total Sales': grandTotalRevenue,
      Remaining: '',
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Product
      { wch: 10 }, // Sales
      { wch: 12 }, // Price
      { wch: 15 }, // Total Sales
      { wch: 12 }, // Remaining
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=sales-report-${new Date().toISOString().split('T')[0]}.xlsx`,
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

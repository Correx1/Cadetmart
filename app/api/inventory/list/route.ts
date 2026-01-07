import { NextResponse } from 'next/server';
import { adminClient } from '@/app/lib/sanity';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  // Check authentication
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const query = `*[_type == "product"] | order(category->name asc, name asc) {
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
    }`;

    const products = await adminClient.fetch(query);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

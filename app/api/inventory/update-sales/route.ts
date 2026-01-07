import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items data' }, { status: 400 });
    }

    // Parse items if they're a string
    const itemsArray = typeof items === 'string' ? JSON.parse(items) : items;

    // Update each product's sales count in Sanity
    const updatePromises = itemsArray.map(async (item: any) => {
      try {
        // Find product by name
        const products = await client.fetch(
          `*[_type == "product" && name == $name][0]`,
          { name: item.name }
        );

        if (!products) {
          console.warn(`Product not found: ${item.name}`);
          return null;
        }

        const productId = products._id;
        const currentSales = products.sales || 0;
        const newSales = currentSales + item.quantity;

        // Update sales count
        await client
          .patch(productId)
          .set({ sales: newSales })
          .commit();

        return {
          product: item.name,
          oldSales: currentSales,
          newSales: newSales,
          quantity: item.quantity
        };
      } catch (error) {
        console.error(`Error updating ${item.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(updatePromises);
    const successful = results.filter(r => r !== null);

    return NextResponse.json({
      success: true,
      updated: successful.length,
      total: itemsArray.length,
      details: successful
    });

  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}

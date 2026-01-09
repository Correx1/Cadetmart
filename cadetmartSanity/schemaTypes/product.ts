import { defineField, defineType } from 'sanity';

export const productSchema = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'fakePrice',
      title: 'Original Price (for discounts)',
      type: 'number',
      description: 'Show a strikethrough price for discounts',
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [{ type: 'image' }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    
    // Inventory Management Fields
    defineField({
      name: 'quantity',
      title: 'Initial Stock Quantity',
      type: 'number',
      description: 'Starting stock quantity',
      initialValue: 0,
    }),
    defineField({
      name: 'sales',
      title: 'Total Sales',
      type: 'number',
      description: 'Auto-increments when purchased',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'stockAdditions',
      title: 'Stock Additions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'quantityAdded',
              title: 'Quantity Added',
              type: 'number',
            },
            {
              name: 'dateAdded',
              title: 'Date Added',
              type: 'datetime',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'remarks',
      title: 'Remarks',
      type: 'text',
      description: 'Additional notes about this product',
    }),
    
    // Digital Product Fields
    defineField({
      name: 'isDigital',
      title: 'Is Digital Product',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'downloadLink',
      title: 'Download Link',
      type: 'url',
      description: 'Link to download digital product (optional)',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
      price: 'price',
    },
    prepare(selection) {
      const { title, media, price } = selection;
      return {
        title,
        subtitle: price ? `₦${price.toLocaleString()}` : 'No price set',
        media,
      };
    },
  },
});

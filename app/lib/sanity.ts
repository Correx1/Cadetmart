import ImageUrlBuilder from '@sanity/image-url';
import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: 'votyhd1p',
  dataset: 'production',
  apiVersion: '2024-03-01',
  useCdn: true, // Fast for public pages
});

// For admin/inventory (real-time)
export const adminClient = createClient({
  projectId: 'votyhd1p',
  dataset: 'production',
  apiVersion: '2024-03-01',
  useCdn: false, // Real-time for inventory
  token: process.env.SANITY_API_TOKEN,
});

const builder = ImageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

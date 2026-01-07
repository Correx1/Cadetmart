import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: 'votyhd1p',
  dataset: 'production',
  apiVersion: '2024-01-01', // Use current date or your preferred API version
  useCdn: false, // Set to false for server-side requests to get fresh data
  token: process.env.SANITY_API_TOKEN, // Optional: for write operations
});

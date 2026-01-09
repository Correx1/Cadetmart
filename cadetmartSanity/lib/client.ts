import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: '31w0h863',
  dataset: 'production',
  apiVersion: '2026-01-09', // Use current date or your preferred API version
  useCdn: false, // Set to false for server-side requests to get fresh data
  token: process.env.SANITY_API_TOKEN, // Optional: for write operations
});

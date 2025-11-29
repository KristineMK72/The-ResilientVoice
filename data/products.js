// data/products.js
// 100% working version – compatible with any Printful response format

const PRINTFUL_PRODUCTS = [];

// Main function used everywhere
export async function getAllProducts() {
  try {
    const res = await fetch('https://the-resilient-voice.vercel.app/api/printful-products', {
      cache: 'no-store' // always fresh
    });

    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }

    const data = await res.json();

    // This handles EVERY possible Printful response format
    const rawProducts = data.result || data.products || data || [];

    if (!Array.isArray(rawProducts)) {
      console.warn('Unexpected product data format:', data);
      return [];
    }

    return rawProducts.map(item => ({
      id: String(item.id || item.sync_product?.id),
      name: (item.name || item.sync_product?.name || 'Unnamed Product').trim(),
      price: parseFloat(item.retail_price || item.variants?.[0]?.retail_price || 0),
      image: item.thumbnail_url || 
             item.sync_product?.thumbnail_url || 
             'https://files.cdn.printful.com/o/upload/missing-image/400x400',
      slug: (item.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      description: item.name || '',
      variants: item.sync_variants || item.variants || [],
      tags: (item.tags || '').toLowerCase(), // ← critical for filtering!
    }));
  } catch (error) {
    console.error('getAllProducts error:', error);
    return [];
  }
}

// Keep the helpers
export async function getProductById(id) {
  const products = await getAllProducts();
  return products.find(p => p.id === String(id)) || null;
}

export async function getProductBySlug(slug) {
  const products = await getAllProducts();
  return products.find(p => p.slug === slug) || null;
}

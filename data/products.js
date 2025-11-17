import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/printful-products')  // Calls your API route → fresh data every load
      .then(res => res.json())
      .then(data => {
        // Filter by category (e.g., "accessories" for beanie)
        const filtered = category
          ? data.filter(p => p.name.toLowerCase().includes(category))
          : data;
        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);  // Refetches if category changes

  if (loading) return <p style={{ textAlign: 'center', padding: '4rem' }}>Loading resilient pieces...</p>;
  if (products.length === 0) return <p style={{ textAlign: 'center', padding: '4rem' }}>No products in this collection yet — check back soon!</p>;

  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ 
            border: '1px solid #eee', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            background: 'white', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <Image
              src={product.thumbnail || '/placeholder-beanie.jpg'}  // Uses Printful's real mockup
              alt={product.name}
              width={400}
              height={400}
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>{product.name}</h3>
              <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '0.9rem' }}>
                {product.sync_variants?.map(v => v.name).join(', ')}  {/* Shows variants like "Black OS" */}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9f6baa' }}>
                ${product.sync_variants?.[0]?.retail_price || 'TBD'}
              </p>
              <button style={{ 
                width: '100%', 
                padding: '0.8rem', 
                background: '#9f6baa', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                marginTop: '1rem' 
              }}>
                Add to Cart →
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

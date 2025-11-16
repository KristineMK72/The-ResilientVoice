import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProductGrid({ category: defaultCategory }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(defaultCategory || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/store-products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    // ... (cart logic remains the same)
  };

  const handleFilter = (category) => {
    setActiveCategory(category);
  };

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.name.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="shop-container">
      <div className="shop-filters">
        <button onClick={() => handleFilter('all')}>All</button>
        <button onClick={() => handleFilter('warrior')}>Warrior</button>
        <button onClick={() => handleFilter('faith')}>Faith</button>
        <button onClick={() => handleFilter('accessories')}>Accessories</button>
      </div>
      <div className="shop-grid">
        {loading ? (
          <p>Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="shop-product">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  width={300}
                  height={300}
                  alt={product.name}
                  style={{ objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/images/default.jpg'; }} // Fallback image
                />
              ) : (
                <img src="/images/default.jpg" alt="Default" width={300} height={300} />
              )}
              <h3>{product.name}</h3>
              <p>${(product.price || 14.99).toFixed(2)}</p>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

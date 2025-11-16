import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProductGrid({ category: defaultCategory }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(defaultCategory || 'all');
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') return JSON.parse(localStorage.getItem('cart') || '[]');
    return [];
  });
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
    const existingItem = cart.find(item => item.id === product.id);
    const updatedCart = existingItem
      ? cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    alert(`${product.name} added to cart!`);
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
        <button className="shop-filter-btn" onClick={() => handleFilter('all')}>All</button>
        <button className="shop-filter-btn" onClick={() => handleFilter('warrior')}>Warrior</button>
        <button className="shop-filter-btn" onClick={() => handleFilter('faith')}>Faith</button>
        <button className="shop-filter-btn" onClick={() => handleFilter('accessories')}>Accessories</button>
      </div>
      <div className="grid shop-grid">
        {loading ? (
          <p>Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found for this category.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="card shop-product">
              {product.thumbnail && (
                <Image
                  src={product.thumbnail}
                  width={300}
                  height={300}
                  alt={product.name}
                  className="shop-image"
                  style={{ objectFit: 'cover' }}
                />
              )}
              <h3 className="shop-name">{product.name}</h3>
              <p className="shop-price">${(product.price || 14.99).toFixed(2)}</p>
              <button className="shop-add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

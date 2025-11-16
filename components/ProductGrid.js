import { useState, useEffect } from "react";
import Image from "next/image";

// Dynamic product data (can be moved to a separate file or API later)
const loadProducts = () => [
  { id: 1, name: "Hope Mug", thumbnail: "/images/hope-mug.jpg", category: "accessories", price: 14.99 },
  { id: 2, name: "Warrior T-Shirt", thumbnail: "/images/warrior-shirt.jpg", category: "warrior", price: 29.99 },
  { id: 3, name: "Grace Hoodie", thumbnail: "/images/grace-hoodie.jpg", category: "faith", price: 49.99 },
  { id: 4, name: "Resilient Cap", thumbnail: "/images/resilient-cap.jpg", category: "accessories", price: 19.99 },
];

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") return JSON.parse(localStorage.getItem("cart") || "[]");
    return [];
  });

  useEffect(() => {
    // Simulate dynamic loading
    setProducts(loadProducts());
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const updatedCart = existingItem
      ? cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${product.name} added to cart!`);
  };

  const filteredProducts = category === "all"
    ? products
    : products.filter(p => p.type.toLowerCase() === category.toLowerCase());

  return (
    <div className="shop-container">
      <div className="shop-filters">
        <button className="shop-filter-btn">All</button>
        <button className="shop-filter-btn">Warrior</button>
        <button className="shop-filter-btn">Faith</button>
        <button className="shop-filter-btn">Accessories</button>
      </div>
      <div className="grid shop-grid">
        {filteredProducts.length === 0 ? (
          <p>No products found for this category.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="card shop-product" data-type={product.type}>
              {product.thumbnail && (
                <Image
                  src={product.thumbnail}
                  width={300}
                  height={300}
                  alt={product.name}
                  className="shop-image"
                  style={{ objectFit: "cover" }}
                />
              )}
              <h3 className="shop-name">{product.name}</h3>
              <p className="shop-price">${product.price.toFixed(2)}</p>
              <button className="shop-add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


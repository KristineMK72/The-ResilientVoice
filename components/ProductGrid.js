import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") return JSON.parse(localStorage.getItem("cart") || "[]");
    return [];
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        // Format products to include required fields
        const formattedProducts = data.map(p => ({
          id: p.id || p._id, // Adjust based on your API response
          name: p.name,
          price: p.price || 0, // Default to 0 if no price
          image: p.thumbnail, // Use thumbnail directly from API
          type: p.category || "all", // Default to "all" if no category
          printfulVariantId: p.printfulVariantId || p.external, // Map to Printful ID or external
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // Fallback to empty array on error
      } finally {
        setLoading(false);
      }
    }
    load();
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

  if (loading) return <p>Loading...</p>;

  // Filter products based on category prop
  const filteredProducts = category === "all"
    ? products
    : products.filter(p => p.type.toLowerCase() === category.toLowerCase());

  return (
    <div className="shop-container">
      {/* Filter Buttons */}
      <div className="shop-filters">
        <button className="shop-filter-btn" onClick={() => {/* No action needed, handled by parent */ }}>All</button>
        <button className="shop-filter-btn" onClick={() => {/* No action needed, handled by parent */ }}>Warrior</button>
        <button className="shop-filter-btn" onClick={() => {/* No action needed, handled by parent */ }}>Faith</button>
        <button className="shop-filter-btn" onClick={() => {/* No action needed, handled by parent */ }}>Accessories</button>
      </div>
      {/* Product Grid */}
      <div className="grid shop-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card shop-product" data-type={product.type}>
            {product.image && (
              <Image
                src={product.image}
                width={300}
                height={300}
                alt={product.name}
                className="shop-image"
                style={{ objectFit: "cover" }} // Ensure image fits properly
              />
            )}
            <h3 className="shop-name">{product.name}</h3>
            <p className="shop-price">${product.price.toFixed(2)}</p>
            <button className="shop-add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

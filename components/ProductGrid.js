import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch products
  useEffect(() => {
    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setProducts(arr);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    const variant = product.sync_variants[0];
    const price = variant.retail_price || "29.99";
    const image = variant.files?.find(f => f.type === "preview")?.url || variant.files?.[0]?.url || "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

    const newItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(price),
      quantity: 1,
      image: image
    };

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, newItem];
    });
  };

  if (loading) return <p style={{textAlign:"center", padding:"4rem"}}>Loading…</p>;

  return (
    <div style={{display:"grid", gap:"2.5rem", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", padding:"2rem"}}>
      {products.map(product => {
        const variant = product.sync_variants?.[0];
        const price = variant?.retail_price || "29.99";
        const imageUrl = variant?.files?.find(f => f.type === "preview")?.url || 
                         variant?.files?.[0]?.url || 
                         "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

        return (
          <div key={product.id} style={{border:"1px solid #eee", borderRadius:"16px", overflow:"hidden", background:"white", boxShadow:"0 8px 25px rgba(0,0,0,0.1)"}}>
            <Link href={`/product/${product.id}`} style={{display:"block"}}>
              <Image
                src={imageUrl}
                alt={product.name}
                width={500}
                height={500}
                style={{width:"100%", height:"350px", objectFit:"cover"}}
              />
            </Link>
            <div style={{padding:"1.5rem"}}>
              <h3 style={{fontSize:"1.4rem", margin:"0 0 0.8rem"}}>{product.name}</h3>
              <p style={{fontSize:"1.8rem", fontWeight:"bold", color:"#9f6baa", margin:"0.5rem 0"}}>
                ${price}
              </p>
              <button
                onClick={() => addToCart(product)}
                style={{width:"100%", padding:"1rem", background:"#9f6baa", color:"white", border:"none", borderRadius:"12px", fontSize:"1.1rem", marginTop:"0.5rem"}}
              >
                Add to Cart
              </button>
              {cart.length > 0 && (
                <div style={{textAlign:"center", marginTop:"1rem"}}>
                  <Link href="/cart" style={{color:"#9f6baa", fontSize:"1rem", textDecoration:"underline"}}>
                    View Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

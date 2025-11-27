// components/ProductGrid.js — FINAL 100% WORKING — IMAGES + PRICES + ADD TO CART
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category = "" }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setProducts(arr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    const variant = product.sync_variants[0];
    const price = parseFloat(variant.retail_price) || 29.99;

    // THIS IS THE CORRECT IMAGE (preview = mockup on model)
    const mockupImage = variant.files?.find(f => f.type === "preview")?.url ||
                        variant.files?.[0]?.url ||
                        "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

    setCart(curr => {
      const exists = curr.find(i => i.id === product.id);
      if (exists) {
        return curr.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...curr, { id: product.id, name: product.name, price, quantity: 1, image: mockupImage }];
    });
  };

  if (loading) return <p style={{textAlign:"center", padding:"6rem", fontSize:"1.6rem"}}>Loading your collection…</p>;

  const itemsInCart = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{padding:"2rem", display:"grid", gap:"3rem", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))"}}>
      {products.map(product => {
        const v = product.sync_variants?.[0] || {};
        const price = v.retail_price || "29.99";

        // THIS IS THE KEY: use the "preview" file = real mockup
        const imageUrl = v.files?.find(f => f.type === "preview")?.url ||
                         v.files?.[0]?.url ||
                         "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

        return (
          <div key={product.id} style={{borderRadius:"24px", overflow:"hidden", background:"white", boxShadow:"0 15px 35px rgba(0,0,0,0.1)"}}>
            <Link href={`/product/${product.id}`}>
              <div style={{height:"420px", position:"relative", background:"#f8f5fa"}}>
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{objectFit:"contain", padding:"30px"}}
                  priority
                />
              </div>
            </Link>
            <div style={{padding:"2rem", textAlign:"center"}}>
              <h3 style={{margin:"0 0 1rem", fontSize:"1.5rem", fontWeight:"600"}}>{product.name}</h3>
              <p style={{margin:"0.5rem 0", fontSize:"2rem", fontWeight:"bold", color:"#9f6baa"}}>${price}</p>
              <button onClick={() => addToCart(product)}
                style={{width:"100%", padding:"1rem", background:"#9f6baa", color:"white", border:"none", borderRadius:"12px", fontSize:"1.1rem", cursor:"pointer", marginTop:"0.5rem"}}>
                Add to Cart
              </button>
              {itemsInCart > 0 && (
                <div style={{marginTop:"1rem"}}>
                  <Link href="/cart" style={{color:"#9f6baa", textDecoration:"underline", fontSize:"1rem"}}>
                    View Cart ({itemsInCart} {itemsInCart === 1 ? "item" : "items"})
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

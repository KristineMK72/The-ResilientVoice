// pages/product/[id].js — FINAL VERSION WITH WORKING ADD TO CART
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch single product
  useEffect(() => {
    if (!id) return;
    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => {
        const found = data.find(p => p.id === parseInt(id));
        setProduct(found);
        setLoading(false);
      });
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const v = product.sync_variants[0];
    const price = parseFloat(v.retail_price) || 29.99;
    const image = v.files?.find(f => f.type === "preview")?.url || v.files?.[0]?.url || "/fallback.jpg";

    setCart(current => {
      const exists = current.find(i => i.id === product.id);
      if (exists) {
        return current.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...current, { id: product.id, name: product.name, price, quantity: 1, image }];
    });
  };

  if (loading) return <p style={{textAlign:"center", padding:"6rem"}}>Loading…</p>;
  if (!product) return <p style={{textAlign:"center", padding:"6rem"}}>Product not found</p>;

  const v = product.sync_variants[0];
  const price = v.retail_price || "29.99";
  const img = v.files?.find(f => f.type === "preview")?.url || v.files?.[0]?.url || "https://files.cdn.printful.com/products/71/71_1723145678.jpg";
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{maxWidth:"1200px", margin:"4rem auto", padding:"0 2rem", display:"grid", gap:"3rem", gridTemplateColumns:"1fr 1fr"}}>
      <div>
        <Image src={img} alt={product.name} width={600} height={600} style={{width:"100%", borderRadius:"16px"}} />
      </div>
      <div>
        <h1 style={{fontSize:"2.8rem", marginBottom:"1rem"}}>{product.name}</h1>
        <p style={{fontSize:"2rem", fontWeight:"bold", color:"#9f6baa", margin:"1.5rem 0"}}>${price}</p>
        <p style={{fontSize:"1.2rem", color:"#555", lineHeight:"1.7"}}>
          Handcrafted for survivors. Every piece tells a story of strength.
        </p>
        <button onClick={addToCart}
          style={{width:"100%", padding:"1.2rem", background:"#9f6baa", color:"white", border:"none", borderRadius:"12px", fontSize:"1.3rem", marginTop:"2rem", cursor:"pointer"}}>
          Add to Cart
        </button>
        {itemCount > 0 && (
          <div style={{textAlign:"center", marginTop:"1.5rem"}}>
            <Link href="/cart" style={{color:"#9f6baa", fontSize:"1.2rem", textDecoration:"underline"}}>
              View Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

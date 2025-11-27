// pages/product/[id].js — FINAL SINGLE PRODUCT PAGE
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Product() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => { const s = localStorage.getItem("cart"); if (s) setCart(JSON.parse(s)); }, []);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    if (!id) return;
    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => setProduct(data.find(p => p.id == id)));
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const v = product.sync_variants[0];
    const price = parseFloat(v.retail_price) || 29.99;
    const image = v.files?.find(f => f.type === "preview")?.url || v.files?.[0]?.url;

    setCart(c => {
      const ex = c.find(i => i.id === product.id);
      if (ex) return c.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { id: product.id, name: product.name, price, quantity: 1, image }];
    });
  };

  if (!product) return <p style={{textAlign:"center", padding:"8rem"}}>Loading…</p>;

  const v = product.sync_variants[0];
  const price = v.retail_price || "29.99";
  const img = v.files?.find(f => f.type === "preview")?.url || v.files?.[0]?.url || "/fallback.jpg";

  return (
    <div style={{maxWidth:"1200px", margin:"4rem auto", padding:"0 2rem", display:"grid", gap:"4rem", gridTemplateColumns:"1fr 1fr"}}>
      <div style={{position:"relative", height:"600px", background:"#f8f5fa", borderRadius:"24px", overflow:"hidden"}}>
        <Image src={img} alt={product.name} fill style={{objectFit:"contain", padding:"40px"}} />
      </div>
      <div style={{padding:"2rem 0"}}>
        <h1 style={{fontSize:"3rem", marginBottom:"1rem"}}>{product.name}</h1>
        <p style={{fontSize:"2.5rem", fontWeight:"bold", color:"#9f6baa", margin:"1.5rem 0"}}>${price}</p>
        <p style={{fontSize:"1.3rem", lineHeight:"1.8", color:"#555"}}>
          Handcrafted for survivors. Every piece carries a story of strength, resilience, and grace.
        </p>
        <button onClick={addToCart} style={{marginTop:"2rem", width:"100%", padding:"1.2rem", background:"#9f6baa", color:"white", border:"none", borderRadius:"16px", fontSize:"1.4rem", cursor:"pointer"}}>
          Add to Cart
        </button>
        {cart.length > 0 && (
          <div style={{marginTop:"1.5rem", textAlign:"center"}}>
            <Link href="/cart" style={{color:"#9f6baa", fontSize:"1.2rem", textDecoration:"underline"}}>
              View Cart ({cart.reduce((s,i)=>s+i.quantity,0)} items)
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

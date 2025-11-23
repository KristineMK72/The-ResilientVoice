// components/ProductGrid.js  ← REPLACE EVERYTHING
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductGrid({ category = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/printful-products");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        let list = [];
        if (data.result && Array.isArray(data.result)) list = data.result;
        else if (Array.isArray(data)) list = data;

        // Filter by category (your actual product names)
        if (category) {
          const lower = category.toLowerCase();
          list = list.filter(p => {
            const name = p.name.toLowerCase();
            if (lower.includes("accessories")) return name.includes("mug") || name.includes("beanie");
            if (lower.includes("grace")) return name.includes("grace");
            if (lower.includes("resilience")) return name.includes("resilien") || name.includes("joy");
            if (lower.includes("warrior")) return name.includes("warrior") || name.includes("power") || name.includes("coura");
            return true;
          });
        }

        setProducts(list);
      } catch (err) {
        console.error("ProductGrid failed:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  if (loading) return <p style={{textAlign:"center", padding:"6rem", fontSize:"1.3rem"}}>Loading your collection…</p>;
  if (products.length === 0) return <p style={{textAlign:"center", padding:"6rem", color:"#999"}}>No items in this collection yet.</p>;

  return (
    <div style={{display:"grid", gap:"3rem", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", padding:"2rem 0"}}>
      {products.map(p => (
        <Link key={p.id} href={`/product/${p.id}`} style={{textDecoration:"none", color:"inherit"}}>
          <div style={{borderRadius:"20px", overflow:"hidden", boxShadow:"0 10px 30px rgba(0,0,0,0.12)", background:"#fff", transition:"0.3s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-12px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{position:"relative", height:"420px", background:"#f8f5f9"}}>
              <Image
                src={p.image || "/fallback.png"}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{objectFit:"contain", padding:"40px"}}
              />
            </div>
            <div style={{padding:"1.8rem", textAlign:"center"}}>
              <h3 style={{margin:"0 0 0.8rem", fontSize:"1.4rem", color:"#333"}}>{p.name}</h3>
              <p style={{margin:0, fontWeight:"bold", fontSize:"1.6rem", color:"#6b46c1"}}>
                ${Number(p.price || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

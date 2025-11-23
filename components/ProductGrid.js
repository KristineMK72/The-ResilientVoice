// components/ProductGrid.js
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
        const data = await res.json();
        let list = Array.isArray(data.result) ? data.result : [];

        // SMART CATEGORY FILTERING (this works with your actual product names)
        if (category) {
          const lower = category.toLowerCase();
          list = list.filter(p => {
            const name = p.name.toLowerCase();
            if (lower === "grace") return name.includes("grace");
            if (lower === "resilience") return name.includes("joy") || name.includes("resilien");
            if (lower === "warrior") return name.includes("warrior") || name.includes("power") || name.includes("coura");
            if (lower === "accessories") return name.includes("mug") || name.includes("beanie");
            return true;
          });
        }

        setProducts(list);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  if (loading) return <p style={{textAlign:"center", padding:"4rem"}}>Loading your beautiful pieces…</p>;
  if (products.length === 0) return <p style={{textAlign:"center", padding:"4rem"}}>No items in this collection yet.</p>;

  return (
    <div style={{display:"grid", gap:"2.5rem", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", padding:"2rem 0"}}>
      {products.map(p => (
        <Link key={p.id} href={`/product/${p.id}`} style={{textDecoration:"none", color:"inherit"}}>
          <div style={{borderRadius:"16px", overflow:"hidden", boxShadow:"0 10px 30px rgba(0,0,0,0.1)", background:"#fff", transition:"0.3s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-10px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{position:"relative", height:"360px", background:"#f9f5fb"}}>
              <Image
                src={p.image || "/fallback.png"}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{objectFit:"contain", padding:"30px"}}
              />
            </div>
            <div style={{padding:"1.5rem", textAlign:"center"}}>
              <h3 style={{margin:"0 0 0.5rem", fontSize:"1.25rem", color:"#333"}}>{p.name}</h3>
              <p style={{margin:0, fontWeight:"bold", fontSize:"1.5rem", color:"#6b46c1"}}>
                ${Number(p.price || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

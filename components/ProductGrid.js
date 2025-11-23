// components/ProductGrid.js  ← REPLACE THE ENTIRE FILE
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

        // CATEGORY FILTERING — THIS IS THE ONE THAT WORKS
        if (category) {
          const lower = category.toLowerCase();
          list = list.filter(p => {
            const name = p.name.toLowerCase();
            if (lower === "accessories") return name.includes("mug") || name.includes("beanie") || name.includes("tote");
            if (lower === "grace") return name.includes("grace");
            if (lower === "resilience") return name.includes("resilien") || name.includes("joy");
            if (lower === "warrior") return name.includes("warrior") || name.includes("power") || name.includes("coura") || name.includes("unbroken");
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

  if (loading) return <p style={{textAlign:"center", padding:"6rem"}}>Loading collection…</p>;
  if (products.length === 0) return <p style={{textAlign:"center", padding:"6rem", color:"#999"}}>No items yet.</p>;

  return (
    <div style={{display:"grid", gap:"3rem", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))"}}>
      {products.map(p => (
        <Link key={p.id} href={`/product/${p.id}`} style={{textDecoration:"none", color:"inherit"}}>
          <div style={{borderRadius:"20px", overflow:"hidden", boxShadow:"0 12px 35px rgba(0,0,0,0.1)", background:"#fff", transition:"0.3s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-12px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{position:"relative", height:"400px", background:"#f9f5fa"}}>
              <Image
                src={p.image || "/fallback.png"}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{objectFit:"contain", padding:"40px"}}
                priority
              />
            </div>
            <div style={{padding:"1.8rem", textAlign:"center"}}>
              <h3 style={{margin:"0 0 0.8rem", fontSize:"1.35rem", color:"#333"}}>{p.name}</h3>
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

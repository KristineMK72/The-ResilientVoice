// components/ProductGrid.js  ← FINAL REAL PRINTFUL VERSION
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function ProductGrid({ category = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => {
        let list = data.result || [];

        if (category) {
          const c = category.toLowerCase();
          list = list.filter(p => {
            const n = p.name.toLowerCase();
            if (c.includes("accessories")) return n.includes("mug") || n.includes("beanie") || n.includes("tote");
            if (c.includes("grace")) return n.includes("grace");
            if (c.includes("resilience")) return n.includes("resilien") || n.includes("joy");
            if (c.includes("warrior")) return n.includes("warrior") || n.includes("power") || n.includes("courage");
            return false;
          });
        }

        setProducts(list);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [category]);

  if (loading) return <p style={{textAlign:"center", padding:"8rem"}}>Loading your collection…</p>;
  if (products.length === 0) return <p style={{textAlign:"center", padding:"8rem", color:"#999"}}>No items in this collection yet.</p>;

  return (
    <div style={{display:"grid", gap:"3rem", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", padding:"2rem 0"}}>
      {products.map(p => (
        <Link key={p.id} href={`/product/${p.id}`} style={{textDecoration:"none", color:"inherit"}}>
          <div style={{borderRadius:"24px", overflow:"hidden", boxShadow:"0 15px 40px rgba(0,0,0,0.12)", background:"#fff", transition:"0.3s"}}>
            <div style={{position:"relative", height:"420px", background:"#f9f5fa"}}>
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{objectFit:"contain", padding:"50px"}}
                priority
              />
            </div>
            <div style={{padding:"2.2rem", textAlign:"center"}}>
              <h3 style={{margin:"0 0 1rem", fontSize:"1.45rem", color:"#333"}}>{p.name}</h3>
              <p style={{margin:0, fontWeight:"bold", fontSize:"1.9rem", color:"#6b46c1"}}>
                ${Number(p.price).toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

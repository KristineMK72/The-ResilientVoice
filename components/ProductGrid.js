// components/ProductGrid.js
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
        let list = Array.isArray(data.result) ? data.result : [];

        if (category) {
          const lower = category.toLowerCase();
          list = list.filter(p => {
            const name = p.name.toLowerCase();
            if (lower === "accessories") return name.includes("mug") || name.includes("beanie");
            if (lower === "grace") return name.includes("grace");
            if (lower === "resilience") return name.includes("resilien") || name.includes("joy");
            if (lower === "warrior") return name.includes("warrior") || name.includes("power") || name.includes("coura");
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

  if (loading) return <p style={{textAlign:"center", padding:"6rem"}}>Loading…</p>;
  if (products.length === 0) return <p style={{textAlign:"center", padding:"6rem", color:"#999"}}>No products in this collection yet.</p>;

  return (
    <div style={{display:"grid", gap:"3rem", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", padding:"2rem 0"}}>
      {products.map(p => (
        <Link key={p.id} href={`/product/${p.id}`} style={{textDecoration:"none"}}>
          <div style={{borderRadius:"20px", overflow:"hidden", boxShadow:"0 12px 35px rgba(0,0,0,0.12)", background:"#fff"}}>
            <div style={{position:"relative", height:"400px", background:"#f9f5fa"}}>
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="33vw"
                style={{objectFit:"contain", padding:"40px"}}
                priority
              />
            </div>
            <div style={{padding:"1.8rem", textAlign:"center"}}>
              <h3 style={{margin:"0 0 0.8rem", fontSize:"1.35rem"}}>{p.name}</h3>
              <p style={{margin:0, fontWeight:"bold", fontSize:"1.7rem", color:"#6b46c1"}}>
                ${Number(p.price).toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

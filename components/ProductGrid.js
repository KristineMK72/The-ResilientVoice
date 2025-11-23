// components/ProductGrid.js  ← FINAL SIMPLE VERSION
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
          const lower = category.toLowerCase();
          list = list.filter(p => {
            const n = p.name.toLowerCase();
            if (lower === "accessories") return n.includes("beanie") || n.includes("mug");
            if (lower === "grace") return n.includes("grace");
            if (lower === "resilience") return n.includes("joy");
            if (lower === "warrior") return n.includes("warrior") || n.includes("mug");
            return true;
          });
        }

        setProducts(list);
        setLoading(false);
      });
  }, [category]);

  if (loading) return <p style={{textAlign:"center", padding:"8rem"}}>Loading…</p>;

  return (
    <div style={{display:"grid", gap:"3rem", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", padding:"2rem 0"}}>
      {products.map(p => (
        <Link key={p.id} href={`/product/${p.id}`} style={{textDecoration:"none"}}>
          <div style={{borderRadius:"20px", overflow:"hidden", boxShadow:"0 12px 35px rgba(0,0,0,0.1)", background:"#fff"}}>
            <div style={{position:"relative", height:"400px", background:"#f9f5fa"}}>
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="33vw"
                style={{objectFit:"contain", padding:"40px"}}
              />
            </div>
            <div style={{padding:"2rem", textAlign:"center"}}>
              <h3 style={{margin:"0 0 1rem", fontSize:"1.4rem"}}>{p.name}</h3>
              <p style={{margin:0, fontWeight:"bold", fontSize:"1.8rem", color:"#6b46c1"}}>
                ${p.price}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

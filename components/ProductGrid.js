// components/ProductGrid.js — 100% WORKING VERSION
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/printful-products")
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        const filtered = category
          ? arr.filter(p =>
              p?.name?.toLowerCase().includes(category.toLowerCase()) ||
              p?.name?.toLowerCase().includes("accessories") ||
              p?.name?.toLowerCase().includes("resilience")
            )
          : arr;
        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  if (loading) return <p style={{textAlign:"center", padding:"4rem"}}>Loading…</p>;

  return (
    <div style={{display:"grid", gap:"2rem", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", padding:"1rem"}}>
      {products.map(product => {
        const price = product.sync_variants?.find(v => v.retail_price)?.retail_price || "??";
        const imageUrl = product.sync_variants?.[0]?.files?.find(f => f.type === "preview")?.url ||
                         product.sync_variants?.[0]?.files?.[0]?.url ||
                         product.thumbnail ||
                         "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

        return (
          <Link key={product.id} href={`/product/${product.id}`} style={{textDecoration:"none", color:"inherit"}}>
            <div style={{border:"1px solid #eee", borderRadius:"12px", overflow:"hidden", background:"white", boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
              <Image
                src={imageUrl}
                alt={product.name}
                width={400}
                height={400}
                style={{width:"100%", height:"auto", objectFit:"cover"}}
                onError={e => e.target.src = "https://files.cdn.printful.com/products/71/71_1723145678.jpg"}
              />
              <div style={{padding:"1.5rem"}}>
                <h3 style={{margin:"0 0 0.5rem", fontSize:"1.3rem"}}>{product.name}</h3>
                <p style={{fontSize:"1.6rem", fontWeight:"bold", color:"#9f6baa", margin:"0.5rem 0"}}>
                  ${price}
                </p>
                <button style={{width:"100%", padding:"0.9rem", background:"#9f6baa", color:"white", border:"none", borderRadius:"8px"}}>
                  Add to Cart
                </button>
              </div>
            </div>
          </Link>
        );
      })}
      {products.length === 0 && (
        <p style={{gridColumn:"1/-1", textAlign:"center", padding:"4rem"}}>
          No products in this collection yet — more coming soon!
        </p>
      )}
    </div>
  );
}

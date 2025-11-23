// pages/product/[id].js   ← OVERWRITE COMPLETELY
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const res = await fetch(`/api/printful-product/[id]?id=${id}`);
        const data = await res.json();

        setProduct(data);

        // Auto-select first available variant
        if (data?.variants?.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p style={{textAlign:"center", padding:"8rem"}}>Loading…</p>;
  if (!product) return <p style={{textAlign:"center", padding:"8rem"}}>Product not found.</p>;

  const price = selectedVariant ? Number(selectedVariant.price).toFixed(2) : "0.00";

  return (
    <main style={{maxWidth:"1200px", margin:"4rem auto", padding:"0 1rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"start"}}>
      
      {/* Image */}
      <div style={{position:"relative", height:"640px", borderRadius:"20px", overflow:"hidden", background:"#f8f5f9"}}>
        <Image
          src={product.image || "/fallback.png"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{objectFit:"contain", padding:"40px"}}
          priority
        />
      </div>

      {/* Details */}
      <div style={{padding:"2rem 0"}}>
        <h1 style={{fontSize:"3rem", margin:"0 0 1rem", color:"#333", lineHeight:"1.2"}}>
          {product.name}
        </h1>

        <p style={{fontSize:"2.2rem", fontWeight:"bold", color:"#6b46c1", margin:"1.5rem 0"}}>
          ${price}
        </p>

        {/* Size Selector */}
        <div style={{margin:"3rem 0"}}>
          <p style={{fontWeight:"600", marginBottom:"1rem", fontSize:"1.2rem"}}>Choose a size:</p>
          <div style={{display:"flex", gap:"1rem", flexWrap:"wrap"}}>
            {product.variants.map(v => (
              <button
                key={v.id}
                disabled={!v.inStock}
                onClick={() => setSelectedVariant(v)}
                style={{
                  padding:"0.9rem 1.6rem",
                  border: selectedVariant?.id === v.id ? "3px solid #6b46c1" : "2px solid #ccc",
                  background: selectedVariant?.id === v.id ? "#f3e8ff" : "#fff",
                  borderRadius:"12px",
                  fontWeight:"600",
                  fontSize:"1.1rem",
                  cursor: v.inStock ? "pointer" : "not-allowed",
                  opacity: v.inStock ? 1 : 0.4,
                }}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart */}
        <button style={{
          marginTop:"2rem",
          padding:"1.2rem 4rem",
          background:"#6b46c1",
          color:"white",
          border:"none",
          borderRadius:"14px",
          fontSize:"1.4rem",
          fontWeight:"bold",
          cursor:"pointer",
        }}>
          Add to Cart
        </button>

        <p style={{marginTop:"3rem", color:"#777", fontStyle:"italic"}}>
          {product.description || "No description available."}
        </p>
      </div>
    </main>
  );
}

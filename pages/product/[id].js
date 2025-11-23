// pages/product/[id].js  ← REPLACE ENTIRE FILE
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
      const res = await fetch(`/api/printful-product/[id]?id=${id}`);
      const data = await res.json();
      setProduct(data);
      if (data?.variants?.length > 0) setSelectedVariant(data.variants[0]);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p style={{textAlign:"center", padding:"8rem"}}>Loading…</p>;
  if (!product) return <p style={{textAlign:"center", padding:"8rem"}}>Not found</p>;

  return (
    <main style={{maxWidth:"1200px", margin:"4rem auto", padding:"0 1rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem"}}>
      <div style={{position:"relative", height:"640px", background:"#f8f5f9", borderRadius:"20px", overflow:"hidden"}}>
        <Image src={product.image || "/fallback.png"} alt={product.name} fill style={{objectFit:"contain", padding:"50px"}} />
      </div>

      <div style={{padding:"2rem 0"}}>
        <h1 style={{fontSize:"3rem", margin:"0 0 1rem"}}>{product.name}</h1>
        <p style={{fontSize:"2.2rem", fontWeight:"bold", color:"#6b46c1", margin:"2rem 0"}}>
          ${selectedVariant ? Number(selectedVariant.price).toFixed(2) : "0.00"}
        </p>

        <div style={{margin:"3rem 0"}}>
          <p style={{fontWeight:"600", marginBottom:"1rem"}}>Size:</p>
          <div style={{display:"flex", gap:"1rem", flexWrap:"wrap"}}>
            {product.variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                style={{
                  padding:"0.9rem 1.6rem",
                  border: selectedVariant?.id === v.id ? "3px solid #6b46c1" : "2px solid #ccc",
                  background: selectedVariant?.id === v.id ? "#f3e8ff" : "#fff",
                  borderRadius:"12px",
                  fontWeight:"600",
                  cursor:"pointer",
                }}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (!selectedVariant) return alert("Please select a size");
            const cart = JSON.parse(localStorage.getItem("resilientvoice_cart") || "[]");
            const existing = cart.find(i => i.variantId === selectedVariant.id);
            if (existing) existing.quantity += 1;
            else cart.push({
              productId: product.id,
              variantId: selectedVariant.id,
              name: product.name,
              size: selectedVariant.size,
              price: selectedVariant.price,
              image: product.image,
              quantity: 1
            });
            localStorage.setItem("resilientvoice_cart", JSON.stringify(cart));
            alert("Added to cart!");
          }}
          style={{
            marginTop:"3rem",
            padding:"1.4rem 5rem",
            background:"#6b46c1",
            color:"white",
            border:"none",
            borderRadius:"16px",
            fontSize:"1.5rem",
            fontWeight:"bold",
            cursor:"pointer",
            boxShadow:"0 10px 30px rgba(107,70,193,0.3)"
          }}
        >
          Add to Cart
        </button>
      </div>
    </main>
  );
}

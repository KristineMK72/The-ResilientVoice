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
        <h1 style={{fontSize:"3rem", margin:"

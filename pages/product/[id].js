// pages/product/[id].js — NEW PRODUCT DETAIL PAGE (fixes 404)
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/printful-products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p.id === parseInt(id));
        setProduct(found);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading product...</p>;
  if (!product) return <h1>Product not found</h1>;

  const firstPrice = product.sync_variants?.find(v => v.retail_price)?.retail_price || "29.99";
  const thumbnail = product.thumbnail || "https://files.cdn.printful.com/products/71/71_1723145678.jpg";

  return (
    <>
      <Head>
        <title>{product.name} | The Resilient Voice</title>
      </Head>
      <main style={{ padding: "6rem 2rem", maxWidth: "1000px", margin: "0 auto", display: "grid", gap: "3rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <Image
            src={thumbnail}
            alt={product.name}
            width={600}
            height={600}
            style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: "12px" }}
          />
        </div>
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{product.name}</h1>
          <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "2rem" }}>
            Handcrafted for survivors. Every piece tells a story of strength.
          </p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#9f6baa", marginBottom: "2rem" }}>
            ${firstPrice}
          </p>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
            {product.sync_variants?.slice(0, 3).map((v, i) => (
              <li key={i} style={{ marginBottom: "0.5rem" }}>{v.name} - ${v.retail_price}</li>
            ))}
          </ul>
          <button style={{ width: "100%", padding: "1rem", background: "#9f6baa", color: "white", border: "none", borderRadius: "8px", fontSize: "1.2rem" }}>
            Add to Cart
          </button>
          <Link href="/cart" style={{ display: "block", textAlign: "center", marginTop: "1rem", color: "#9f6baa" }}>
            View Cart
          </Link>
        </div>
      </main>
    </>
  );
}

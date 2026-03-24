// components/ProductGrid.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function sizeRank(size = "") {
  switch (String(size).toUpperCase()) {
    case "XS":
      return 1;
    case "S":
      return 2;
    case "M":
      return 3;
    case "L":
      return 4;
    case "XL":
      return 5;
    case "2XL":
      return 6;
    case "3XL":
      return 7;
    case "4XL":
      return 8;
    default:
      return 99;
  }
}

function groupVariants(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const productId = String(row.printful_sync_product_id || "");
    if (!productId) continue;

    if (!map.has(productId)) {
      map.set(productId, {
        id: productId,
        name: row.product_title || row.name || "Unnamed Tee",
        image: row.thumbnail_url || row.image_url || "/Logo.jpeg",
        category: row.category || null,
        minPrice:
          row.retail_price != null ? Number(row.retail_price) : null,
        maxPrice:
          row.retail_price != null ? Number(row.retail_price) : null,
        variants: [],
        colors: new Set(),
        sizes: new Set(),
      });
    }

    const product = map.get(productId);

    if (!product.image && (row.thumbnail_url || row.image_url)) {
      product.image = row.thumbnail_url || row.image_url;
    }

    if (row.product_title && product.name === "Unnamed Tee") {
      product.name = row.product_title;
    }

    const price =
      row.retail_price != null ? Number(row.retail_price) : null;

    if (price != null) {
      product.minPrice =
        product.minPrice == null ? price : Math.min(product.minPrice, price);
      product.maxPrice =
        product.maxPrice == null ? price : Math.max(product.maxPrice, price);
    }

    if (row.color) product.colors.add(row.color);
    if (row.size) product.sizes.add(row.size);

    product.variants.push({
      sync_variant_id: row.printful_sync_variant_id,
      sku: row.sku,
      color: row.color,
      size: row.size,
      retail_price:
        row.retail_price != null ? Number(row.retail_price) : null,
      stripe_price_id: row.stripe_price_id || null,
    });
  }

  return Array.from(map.values())
    .map((product) => ({
      ...product,
      colors: Array.from(product.colors).sort(),
      sizes: Array.from(product.sizes).sort(
        (a, b) => sizeRank(a) - sizeRank(b)
      ),
      price:
        product.minPrice != null ? Number(product.minPrice) : 29.99,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function ProductGrid() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseBrowserClient();

    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("printful_variants")
          .select(
            [
              "printful_sync_product_id",
              "printful_sync_variant_id",
              "name",
              "product_title",
              "category",
              "thumbnail_url",
              "image_url",
              "color",
              "size",
              "sku",
              "retail_price",
              "currency",
              "is_active",
              "stripe_price_id",
            ].join(",")
          )
          .eq("is_active", true)
          .order("printful_sync_product_id", { ascending: true });

        if (!mounted) return;

        if (error) {
          console.error("Supabase fetch failed", error);
          setRows([]);
          return;
        }

        setRows(data || []);
      } catch (err) {
        console.error("Product fetch failed", err);
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const products = useMemo(() => groupVariants(rows), [rows]);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    const firstVariant = product.variants?.[0] || null;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      image: product.image || "/Logo.jpeg",
      quantity: 1,
      variant: firstVariant,
      variants: product.variants || [],
    };

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "8rem 2rem",
          color: "#9f6baa",
        }}
      >
        <h2>Loading your collection...</h2>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "10rem 2rem",
          color: "#9f6baa",
        }}
      >
        <h2>Collection syncing from Supabase</h2>
        <p style={{ fontSize: "1.2rem", margin: "1rem 0" }}>
          Your products are loading right now...
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "1rem 2rem",
            background: "#9f6baa",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          Refresh Now
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "2.5rem",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        padding: "2rem",
      }}
    >
      {products.map((product) => {
        const priceLabel =
          product.minPrice != null && product.maxPrice != null
            ? product.minPrice === product.maxPrice
              ? `$${product.minPrice.toFixed(2)}`
              : `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`
            : `$${product.price.toFixed(2)}`;

        return (
          <div
            key={product.id}
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(159,107,170,0.3)",
              backdropFilter: "blur(10px)",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-8px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <Link href={`/product/${product.id}`}>
              <div
                style={{
                  position: "relative",
                  height: "380px",
                  background: "#111",
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  style={{ objectFit: "contain", padding: "2rem" }}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
            </Link>

            <div style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.4rem",
                  color: "#fff",
                }}
              >
                {product.name}
              </h3>

              <p
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  color: "#9f6baa",
                  margin: "0.5rem 0",
                }}
              >
                {priceLabel}
              </p>

              {!!product.colors.length && (
                <p
                  style={{
                    color: "#d8c3df",
                    fontSize: "0.95rem",
                    margin: "0.4rem 0",
                  }}
                >
                  Colors: {product.colors.join(", ")}
                </p>
              )}

              {!!product.sizes.length && (
                <p
                  style={{
                    color: "#d8c3df",
                    fontSize: "0.95rem",
                    margin: "0.4rem 0 1rem",
                  }}
                >
                  Sizes: {product.sizes.join(", ")}
                </p>
              )}

              <button
                onClick={() => addToCart(product)}
                style={{
                  width: "100%",
                  padding: "0.95rem 1.2rem",
                  background: "#9f6baa",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

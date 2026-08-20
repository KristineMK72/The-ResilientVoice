import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const BADGE = {
  grace: "gg-badge-grace",
  patriot: "gg-badge-patriot",
  social: "gg-badge-social",
};

/**
 * Unified product card for all collections + grids.
 */
export default function ProductCard({
  id,
  name,
  priceLabel,
  image,
  imageFallbacks = [],
  category = "social",
  badgeLabel,
  href,
}) {
  const [src, setSrc] = useState(image || "/fallback.png");
  const [fbIndex, setFbIndex] = useState(0);
  const link = href || `/product/${id}`;
  const badgeClass = BADGE[category] || BADGE.social;
  const label =
    badgeLabel ||
    (category === "grace"
      ? "Grace"
      : category === "patriot"
      ? "Patriot"
      : "Social Impact");

  function onError() {
    if (fbIndex < imageFallbacks.length) {
      setSrc(imageFallbacks[fbIndex]);
      setFbIndex((i) => i + 1);
    } else {
      setSrc("/fallback.png");
    }
  }

  return (
    <article className="gg-card">
      <Link href={link} style={{ display: "block" }}>
        <div
          style={{
            position: "relative",
            height: 340,
            background: "linear-gradient(180deg, #0b1220 0%, #111827 100%)",
          }}
        >
          <Image
            src={src}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            style={{ objectFit: "contain", padding: "1.75rem" }}
            onError={onError}
          />
          <span
            className={`gg-badge ${badgeClass}`}
            style={{ position: "absolute", top: 14, left: 14 }}
          >
            {label}
          </span>
        </div>
      </Link>

      <div style={{ padding: "1.35rem 1.35rem 1.5rem", textAlign: "center" }}>
        <h3
          style={{
            margin: "0 0 0.35rem",
            fontSize: "1.2rem",
            fontWeight: 600,
            letterSpacing: "0.01em",
            color: "var(--gg-text)",
          }}
        >
          {name}
        </h3>
        {priceLabel && <p className="gg-price" style={{ fontSize: "1.5rem" }}>{priceLabel}</p>}
        <Link href={link} className="gg-btn gg-btn-primary gg-btn-block" style={{ marginTop: 8 }}>
          View details →
        </Link>
      </div>
    </article>
  );
}

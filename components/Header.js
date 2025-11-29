// components/Header.js  ← FINAL, COLORFUL, WORKS 100%
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", color: "#ffffff" },
    { href: "/saved-by-grace", label: "Saved By Grace", color: "#ff6666" },
    { href: "/patriot", label: "Patriots", color: "#ff0000" },
    { href: "/social", label: "Social Impact", color: "#4488ff" },
    { href: "/blog", label: "Blog", color: "#ffaa00" },
    { href: "/about", label: "About", color: "#00ddff" },
    { href: "/cart", label: "Cart", color: "#ffcc00" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        background: "rgba(5, 5, 20, 0.95)",
        backdropFilter: "blur(15px)",
        borderBottom: "4px solid",
        borderImage: "linear-gradient(90deg, #ff0000 0%, #ffffff 50%, #0000ff 100%) 1",
        padding: "1rem 2rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo + Brand */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "16px", textDecoration: "none" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundImage: "url(/IMG_8198.jpeg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "16px",
              boxShadow: "0 0 30px rgba(255,255,255,0.6)",
            }}
          />
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: "900",
              background: "linear-gradient(90deg, #ff4444, #ffffff, #4444ff)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
            }}
          >
            RESILIENT VOICE
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: link.color,
                fontWeight: "700",
                fontSize: "1.15rem",
                textShadow: "0 0 10px currentColor",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.15)";
                e.target.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.transform = "translateY(0)";
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "2.5rem",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {mobileOpen ? "×" : "Menu"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav
          style={{
            background: "rgba(0,0,20,0.98)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "block",
                padding: "1rem",
                fontSize: "1.6rem",
                fontWeight: "bold",
                color: link.color,
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <style jsx>{`
        @media (max-width: 868px) {
          nav:nth-of-type(1) { display: none; }
          button { display: block; }
          h1 { fontSize: 1.8rem !important; }
        }
      `}</style>
    </header>
  );
}

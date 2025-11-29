// components/Header.js  ← FINAL COLORFUL + ALL PAGES
"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", color: "#ffffff" },
    { href: "/saved-by-grace", label: "Saved By Grace", color: "#ff4444" },
    { href: "/patriot", label: "Patriots", color: "#ff0000" },
    { href: "/social", label: "Social Impact", color: "#4488ff" },
    { href: "/blog", label: "Blog", color: "#ffaa00" },
    { href: "/about", label: "About", color: "#00ddff" },
    { href: "/cart", label: "Cart", color: "#ffcc00" },
  ];

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 9999,
          width: "100%",
          background: "rgba(5, 5, 20, 0.92)",
          backdropFilter: "blur(15px)",
          borderBottom: "4px solid",
          borderImage: "linear-gradient(90deg, #ff0000 0%, #ffffff 50%, #0000ff 100%) 1",
          padding: "1rem 2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
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
          {/* Logo + Brand Name */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "16px", textDecoration: "none" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundImage: "url(/IMG_8198.jpeg)",
                backgroundSize: "cover",
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
                textShadow: "0 0 20px rgba(255,100,100,0.8)",
              }}
            >
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
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
                  fontWeight: "700 1.15rem/1 sans-serif",
                  textShadow: "0 0 10px currentColor",
                  transition: "all 0.3s",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
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
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <nav
            style={{
              background: "rgba(0,0,20,0.98)",
              padding: "2rem",
              textAlign: "center",
              borderTop: "3px solid #ff0000",
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
                  textShadow: "0 0 15px currentColor",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Push page content down so it's not hidden under fixed header */}
      <div style={{ height: "100px" }} />

      </>

      <style jsx>{`
        @media (max-width: 868px) {
          nav { display: none; }
          button { display: block; }
          h1 { font-size: 1.8rem !important; }
        }
      `}</style>
    </>
  );
}

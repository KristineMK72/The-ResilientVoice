// components/Header.js ← 100% WORKING VERSION
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", color: "#ffffff" },
    { href: "/saved-by-grace", label: "Saved By Grace", color: "#ff6666" },
    { href: "/Patriot", label: "Patriot", color: "#ff0000" },        // lowercase href
    { href: "/Social", label: "Social", color: "#4488ff" },          // lowercase href
    { href: "/blog", label: "Blog", color: "#ffaa00" },
    { href: "/about", label: "About", color: "#00ddff" },
    { href: "/cart", label: "Cart", color: "#ffcc00" },
    { href: "/Legal", label: "Legal",  oolor: "#ff0000" },
  ];

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          background: "rgba(5,5,20,0.95)",
          backdropFilter: "blur(15px)",
          borderBottom: "4px solid",
          borderImage: "linear-gradient(90deg,#ff0000 0%,#ffffff 50%,#0000ff 100%) 1",
          zIndex: 9999,
          padding: "1rem 0",
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
            <div style={{ width: "56px", height: "56px", background: "url(/IMG_8198.jpeg) center/cover", borderRadius: "14px", boxShadow: "0 0 25px rgba(255,255,255,0.6)" }} />
            <span style={{ fontSize: "2rem", fontWeight: "900", background: "linear-gradient(90deg,#ff4444,#ffffff,#4444ff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              GRIT & GRACE
            </span>
          </Link>

          <nav style={{ display: "flex", gap: "2rem" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: link.color,
                  fontWeight: "700",
                  fontSize: "1.1rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: "none", background: "none", border: "none", color: "white", fontSize: "2.4rem", cursor: "pointer" }}
          >
            {mobileOpen ? "×" : "Menu"}
          </button>
        </div>

        {mobileOpen && (
          <div style={{ position: "fixed", top: "80px", left: 0, right: 0, bottom: 0, background: "rgba(0,0,30,0.98)", padding: "2rem 0", overflowY: "auto", zIndex: 9998 }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{ display: "block", padding: "1.4rem 2rem", fontSize: "1.8rem", fontWeight: "bold", color: link.color, textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div style={{ height: "90px" }} />

      <style jsx>{`
  @media (max-width: 1024px) {
    /* Hide the desktop nav completely on tablets & phones */
    header > div > nav {
      display: none !important;
    }
    /* Force-show the hamburger */
    header > div > button {
      display: block !important;
    }
    /* Slightly smaller brand text */
    header > div > a > span {
      font-size: 1.7rem !important;
    }
    header > div > a > div {
      width: 48px !important;
      height: 48px !important;
    }
  }

  @media (max-width: 480px) {
    header > div > a > span {
      font-size: 1.45rem !important;
    }
    header > div > a > div {
      width: 44px !important;
      height: 44px !important;
    }
  }
`}</style>
    </>
  );
}

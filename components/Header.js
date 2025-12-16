"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", color: "#ffffff" },
    { href: "/saved-by-grace", label: "Saved By Grace", color: "#ff6666" },
    { href: "/Patriot", label: "Patriot", color: "#ff0000" },
    { href: "/Social", label: "Social", color: "#4488ff" },
    { href: "/giving", label: "Giving Back", color: "#00cc66" },
    { href: "/blog", label: "Blog", color: "#ffaa00" },
    { href: "/about", label: "About", color: "#00ddff" },
    { href: "/cart", label: "Cart", color: "#ffcc00" },
    { href: "/LegalPage", label: "Legal", color: "#ff0000" },
  ];

  // ✅ Lock scroll when drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // ✅ ESC closes drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "url(/IMG_8198.jpeg) center/cover",
                borderRadius: "14px",
                boxShadow: "0 0 25px rgba(255,255,255,0.6)",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: "900",
                  background: "linear-gradient(90deg,#ff4444,#ffffff,#4444ff)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  letterSpacing: "0.1em",
                }}
              >
                GRIT & GRACE
              </span>

              <span
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "500",
                  marginTop: "2px",
                  fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                  color: "rgba(255, 255, 255, 0.8)",
                  textAlign: "center",
                  letterSpacing: "0.15em",
                }}
              >
                A Resilient Voice
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="mobile-menu-button"
            style={{
              display: "none",
              background: "rgba(255,255,255,0.1)",
              border: "2px solid white",
              color: "white",
              padding: "10px 15px",
              borderRadius: "8px",
              fontSize: "1.5rem",
              fontWeight: "900",
              cursor: "pointer",
              transition: "all 0.3s",
              lineHeight: 1,
            }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div style={{ height: "90px" }} />

      {/* ✅ Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 9998,
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 200ms ease",
        }}
      />

      {/* ✅ Left Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "86vw",
          maxWidth: "420px",
          background: "rgba(0,0,30,0.98)",
          zIndex: 9999,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 240ms ease",
          display: "flex",
          flexDirection: "column",
          paddingTop: "90px", // clears the fixed header height
          overflowY: "auto",
          borderRight: "2px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ padding: "1rem 0" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "1.3rem 1.6rem",
                fontSize: "1.55rem",
                fontWeight: "800",
                color: link.color,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: "auto", padding: "1.2rem 1.6rem", color: "rgba(255,255,255,0.65)" }}>
          <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Grit & Grace</div>
          <div style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>
            Faith • Freedom • Healing • Purpose
          </div>
        </div>
      </aside>

      <style jsx>{`
        @media (max-width: 1024px) {
          header > div > nav {
            display: none !important;
          }
          header > div > button.mobile-menu-button {
            display: block !important;
            min-width: 60px;
            min-height: 48px;
            padding: 8px 12px;
          }
          header > div > a > div:nth-child(2) > span:nth-child(1) {
            font-size: 1.7rem !important;
          }
          header > div > a > div:nth-child(2) > span:nth-child(2) {
            font-size: 0.8rem !important;
          }
          header > div > a > div:nth-child(1) {
            width: 48px !important;
            height: 48px !important;
          }
        }

        @media (max-width: 480px) {
          header > div > a > div:nth-child(2) > span:nth-child(1) {
            font-size: 1.45rem !important;
          }
          header > div > a > div:nth-child(2) > span:nth-child(2) {
            font-size: 0.7rem !important;
          }
          header > div > a > div:nth-child(1) {
            width: 44px !important;
            height: 44px !important;
          }
        }
      `}</style>
    </>
  );
}

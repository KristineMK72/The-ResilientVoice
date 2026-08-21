"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/lookbook", label: "Lookbook" },
    { href: "/saved-by-grace", label: "Grace" },
    { href: "/Patriot", label: "Patriot" },
    { href: "/Social", label: "Social" },
    { href: "/giving", label: "Giving" },
    { href: "/about", label: "About" },
    { href: "/cart", label: "Cart" },
  ];

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close drawer when switching to desktop width
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
          backdropFilter: "blur(16px)",
          borderBottom: "3px solid",
          borderImage: "linear-gradient(90deg,#ff3b3b,#fff,#3b5bff) 1",
          zIndex: 9999,
          padding: "0.75rem 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            minHeight: "56px",
          }}
        >
          {/* Brand — never shrink away */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textDecoration: "none",
              flex: "0 1 auto",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                background: "url(/gritngrlogo.png) center / contain no-repeat",
                borderRadius: 12,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  background: "linear-gradient(90deg,#ff6b6b,#fff,#6b8cff)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                GRIT & GRACE
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  marginTop: 3,
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                For A Resilient Voice
              </span>
            </div>
          </Link>

          {/* Desktop nav — hidden on tablet/phone via CSS */}
          <nav
            className="gg-desk-nav"
            aria-label="Main"
            style={{
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              gap: "0.15rem",
              flex: "0 0 auto",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  padding: "0.4rem 0.55rem",
                  borderRadius: 8,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Hamburger — only mobile/tablet */}
          <button
            type="button"
            className="gg-menu-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            style={{
              display: "none",
              flexShrink: 0,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "white",
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: "1.35rem",
              fontWeight: 900,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      {/* Fixed spacer so page content isn't under the header */}
      <div style={{ height: 78, flexShrink: 0 }} aria-hidden />

      {/* Backdrop */}
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

      {/* Mobile drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "min(86vw, 360px)",
          background: "rgba(5,5,24,0.98)",
          zIndex: 9999,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 240ms ease",
          display: "flex",
          flexDirection: "column",
          paddingTop: 78,
          overflowY: "auto",
          borderRight: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ padding: "0.5rem 0" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "1.05rem 1.4rem",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#fff",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/blog"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              padding: "1.05rem 1.4rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.65)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              textDecoration: "none",
            }}
          >
            Journal
          </Link>
          <Link
            href="/LegalPage"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              padding: "1.05rem 1.4rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.65)",
              textDecoration: "none",
            }}
          >
            Legal
          </Link>
        </div>
        <div
          style={{
            marginTop: "auto",
            padding: "1.2rem 1.4rem 2rem",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Grit & Grace</div>
          <div style={{ fontSize: "0.9rem" }}>Faith · Freedom · Healing · Purpose</div>
        </div>
      </aside>

      {/* Global media queries — reliable outside styled-jsx scoping quirks */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .gg-desk-nav {
            display: none !important;
          }
          .gg-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 1025px) {
          .gg-desk-nav {
            display: flex !important;
          }
          .gg-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

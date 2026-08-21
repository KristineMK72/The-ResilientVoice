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

  return (
    <>
      <header className="hdr">
        <div className="hdrInner">
          <Link href="/" className="brand">
            <div className="brandMark" />
            <div className="brandText">
              <span className="brandName">GRIT & GRACE</span>
              <span className="brandSub">For A Resilient Voice</span>
            </div>
          </Link>

          <nav className="deskNav" aria-label="Main">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="navLink">
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="menuBtn"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      <div className="hdrSpacer" />

      <div
        className="backdrop"
        onClick={() => setMobileOpen(false)}
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      />

      <aside
        className="drawer"
        style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="drawerLinks">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="drawerLink"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/blog" onClick={() => setMobileOpen(false)} className="drawerLink muted">
            Journal
          </Link>
          <Link href="/LegalPage" onClick={() => setMobileOpen(false)} className="drawerLink muted">
            Legal
          </Link>
        </div>
        <div className="drawerFoot">
          <strong>Grit & Grace</strong>
          <span>Faith · Freedom · Healing · Purpose</span>
        </div>
      </aside>

      <style jsx>{`
        .hdr {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: rgba(5, 5, 20, 0.92);
          backdrop-filter: blur(16px);
          border-bottom: 3px solid;
          border-image: linear-gradient(90deg, #ff3b3b, #fff, #3b5bff) 1;
          z-index: 9999;
          padding: 0.85rem 0;
        }
        .hdrInner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          min-width: 0;
        }
        .brandMark {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          background: url(/gritngrlogo.png) center / contain no-repeat, rgba(255, 255, 255, 0.08);
          border-radius: 12px;
        }
        .brandText {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
          min-width: 0;
        }
        .brandName {
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          background: linear-gradient(90deg, #ff6b6b, #fff, #6b8cff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .brandSub {
          font-size: 0.78rem;
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.75);
          letter-spacing: 0.08em;
        }
        .deskNav {
          display: flex;
          flex-wrap: wrap;
          gap: 0.15rem 0.35rem;
          justify-content: flex-end;
        }
        .navLink {
          color: rgba(255, 255, 255, 0.92);
          font-weight: 700;
          font-size: 0.92rem;
          padding: 0.45rem 0.7rem;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .navLink:hover {
          background: rgba(255, 255, 255, 0.12);
        }
        .menuBtn {
          display: none;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 1.35rem;
          font-weight: 900;
          cursor: pointer;
          line-height: 1;
        }
        .hdrSpacer {
          height: 82px;
        }
        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 9998;
          transition: opacity 200ms ease;
        }
        .drawer {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 86vw;
          max-width: 380px;
          background: rgba(5, 5, 24, 0.98);
          z-index: 9999;
          transition: transform 240ms ease;
          display: flex;
          flex-direction: column;
          padding-top: 82px;
          overflow-y: auto;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
        }
        .drawerLinks {
          padding: 0.5rem 0;
        }
        .drawerLink {
          display: block;
          padding: 1.05rem 1.4rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          text-decoration: none;
        }
        .drawerLink.muted {
          color: rgba(255, 255, 255, 0.65);
          font-size: 1.05rem;
          font-weight: 700;
        }
        .drawerFoot {
          margin-top: auto;
          padding: 1.2rem 1.4rem 2rem;
          color: rgba(255, 255, 255, 0.65);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        @media (max-width: 960px) {
          .deskNav {
            display: none;
          }
          .menuBtn {
            display: block;
          }
        }
        @media (max-width: 480px) {
          .brandName {
            font-size: 1.15rem;
          }
          .brandSub {
            font-size: 0.68rem;
          }
          .brandMark {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </>
  );
}

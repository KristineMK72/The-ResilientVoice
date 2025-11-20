// /components/Navbar.js (Clean, Fixed Code)
import Link from 'next/link';
import React from 'react';

export default function Navbar() {
  return (
    <nav className="header">
      
      {/* Logo/Site Title Link */}
      <Link href="/" style={logoStyle}>
        The Resilient Voice
      </Link>
      
      {/* Navigation Links */}
      <nav>
        <Link href="/" style={navLinkStyle}>Home</Link>
        <Link href="/about" style={navLinkStyle}>About</Link>
        <Link href="/resilience" style={navLinkStyle}>Resilience</Link>
        <Link href="/shop" style={navLinkStyle}>Shop</Link>
        <Link href="/blog" style={navLinkStyle}>Blog</Link>
      </nav>
      
    </nav>
  );
}

const logoStyle = { 
  color: 'white', 
  fontSize: '1.5rem', 
  fontWeight: 'bold',
  textDecoration: 'none' 
};

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1.1rem',
  padding: '0.5rem 0.75rem',
};

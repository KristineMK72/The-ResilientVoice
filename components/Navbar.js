// /components/Navbar.js (COMPLETE AND FIXED)
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
        <Link href="/about" style={navLinkStyle}>About</Link>
        <Link href="/blog" style={navLinkStyle}>Blog</Link>
        <Link href="/gallery" style={navLinkStyle}>Gallery</Link> {/* <-- ADDED LINK */}
        <Link href="/resilience" style={navLinkStyle}>Resilience</Link>
        <Link href="/shop" style={navLinkStyle}>Shop</Link>
        {/* You may want to add 'accessories.js', 'cart.js', 'grace.js', 'warrior-spirit.js' too */}
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

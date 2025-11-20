// /components/Navbar.js (FINAL, COMPLETE LINKS)
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
      <nav style={navContainerStyle}> {/* Added container style for better mobile control */}
        {/* Core Pages */}
        <Link href="/about" style={navLinkStyle}>About</Link>
        <Link href="/blog" style={navLinkStyle}>Blog</Link>
        <Link href="/resilience" style={navLinkStyle}>Resilience</Link>
        
        {/* Shop/Gallery Pages */}
        <Link href="/shop" style={navLinkStyle}>Shop</Link>
        <Link href="/accessories" style={navLinkStyle}>Accessories</Link>
        <Link href="/gallery" style={navLinkStyle}>Gallery</Link>
        <Link href="/cart" style={navLinkStyle}>Cart</Link>
        
        {/* Specific Pages */}
        <Link href="/grace" style={navLinkStyle}>Grace</Link>
        <Link href="/warrior-spirit" style={navLinkStyle}>Warrior Spirit</Link>
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

// Container style to help with spacing on large screens
const navContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap', // Allows links to wrap if screen is narrow
    justifyContent: 'flex-end',
    gap: '0.5rem', // Slight gap between links
};

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1.1rem',
  padding: '0.5rem 0.75rem',
};

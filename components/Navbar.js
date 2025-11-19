// /components/Navbar.js

import Link from 'next/link';
// We are intentionally NOT importing 'react-feather' to prevent the Vercel crash
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [itemCount, setItemCount] = useState(0);

  // Poll localStorage to update cart count in real time
  useEffect(() => {
    const updateCount = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          // Calculate the total number of items across all variants
          const count = cart.reduce((sum, item) => sum + item.quantity, 0);
          setItemCount(count);
        } else {
          setItemCount(0);
        }
      } catch (e) {
        console.error("Error parsing cart from localStorage", e);
      }
    };
    
    // Update immediately and then every second (1000ms)
    updateCount();
    const interval = setInterval(updateCount, 1000); 

    return () => clearInterval(interval);
  }, []);

  // Standard styles for all primary navigation links
  const linkStyle = { color: 'white', textDecoration: 'none', margin: '0 1rem', fontSize: '1.1rem' };
  
  // Specific style for the cart link container
  const cartLinkStyle = { 
    ...linkStyle, 
    marginLeft: '2rem', 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center' 
  };

  return (
    <nav style={{ 
      background: 'black', 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ color: 'white', fontSize: '1.8rem', fontWeight: 'bold', textDecoration: 'none' }}>
        Resilient Voice
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={linkStyle}>Home</Link>
        <Link href="/accessories" style={linkStyle}>Accessories</Link>
        <Link href="/resilience" style={linkStyle}>Resilience</Link>
        <Link href="/grace" style={linkStyle}>Grace</Link>
        <Link href="/warrior-spirit" style={linkStyle}>Warrior Spirit</Link>
        <Link href="/blog" style={linkStyle}>Blog</Link>
        
        {/* Cart Link with stable emoji/text and item count badge */}
<Link href="/cart" style={cartLinkStyle}>
  
 {/* Replaced the crashing react-feather icon with a stable emoji and text */}
<span style={{ marginRight: '5px', fontSize: '1.2rem' }}>🛒 Shopping Cart</span>
  
  {/* TEMPORARY CHANGE TO FORCE PUSH */}
  My Cart 

  {itemCount > 0 && (
    <span style={{
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      background: '#9f6baa',
      color: 'white',
      borderRadius: '50%',
      padding: '2px 7px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      lineHeight: '1',
    }}>
      {itemCount}
    </span>
  )}
</Link>
      </div>
    </nav>
  );
}

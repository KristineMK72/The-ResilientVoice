import Link from 'next/link';
import { ShoppingCart } from 'react-feather';
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
          const count = cart.reduce((sum, item) => sum + item.quantity, 0);
          setItemCount(count);
        } else {
          setItemCount(0);
        }
      } catch (e) {
        console.error("Error parsing cart from localStorage", e);
      }
    };
    
    // Update immediately and then every second
    updateCount();
    const interval = setInterval(updateCount, 1000); 

    return () => clearInterval(interval);
  }, []);

  const linkStyle = { color: 'white', textDecoration: 'none', margin: '0 1rem', fontSize: '1.1rem' };
  const cartIconStyle = { color: 'white', position: 'relative' };

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
        
        <Link href="/cart" style={{...linkStyle, marginLeft: '2rem', ...cartIconStyle}}>
          <ShoppingCart size={24} />
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

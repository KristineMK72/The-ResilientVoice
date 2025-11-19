// /components/Navbar.js

// ... (Code above the return statement is correct) ...

 // /components/Navbar.js

// ... (Code above the return statement is correct) ...

  return (
    <nav style={{ 
      /* ... (Nav styles) ... */
    }}>
      <Link href="/" style={/* ... */}>
        Resilient Voice
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={linkStyle}>Home</Link>
        <Link href="/accessories" style={linkStyle}>Accessories</Link>
        <Link href="/resilience" style={linkStyle}>Resilience</Link>
        <Link href="/grace" style={linkStyle}>Grace</Link>
        <Link href="/warrior-spirit" style={linkStyle}>Warrior Spirit</Link>
        <Link href="/blog" style={linkStyle}>Blog</Link>
        
        {/* THIS IS THE CLEANED CART LINK BLOCK */}
        <Link href="/cart" style={cartLinkStyle}>
          
          {/* Final clean display of the Cart icon and text */}
          <span style={{ marginRight: '5px', fontSize: '1.2rem' }}>🛒 Final Push</span>

          {/* This is the badge that shows the item count */}
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
        {/* END OF CART LINK BLOCK */}
        
      </div>
    </nav>
  );
}

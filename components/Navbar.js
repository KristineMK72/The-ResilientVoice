// /components/Navbar.js

// ... (Code above the return statement is correct) ...

  return (
    <nav style={{ 
      // ... (Nav styles) ...
    }}>
      <Link href="/" style={/* ... */}>
        Resilient Voice
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={linkStyle}>Home</Link>
        {/* ... All other navigation links are here ... */}
        <Link href="/blog" style={linkStyle}>Blog</Link>
        
        {/* This is the clean, correct Cart Link block ⬇️ */}
        <Link href="/cart" style={cartLinkStyle}>
          
          <span style={{ marginRight: '5px', fontSize: '1.2rem' }}>🛒 Final Push</span>
          
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
        {/* End of Cart Link block ⬆️ */}
        
      </div>
    </nav>
  );
}

// /pages/_app.js (FINAL, CLEAN STRUCTURE)
import React from 'react';
import Header from '../components/Header'; // Now contains all navigation
import Footer from '../components/Footer'; // The simple footer component
import '../styles/global.css'; // Global responsive styles

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* 1. Header and Navbar */}
      <Header /> 
      
      {/* 2. Main Page Content */}
      <Component {...pageProps} /> 
      
      {/* 3. Footer */}
      <Footer />
    </>
  );
}

export default MyApp;

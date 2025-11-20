// /pages/_app.js (FINAL FIX)
import React from 'react';
import Header from '../components/Header'; // Renders the navigation bar
import Footer from '../components/Footer'; // Renders the footer
import '../styles/global.css'; // Loads all responsive styles

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* The Header/Navbar is rendered here */}
      <Header /> 
      
      {/* The content of your specific pages (index, shop, blog, etc.) */}
      <Component {...pageProps} /> 
      
      {/* The Footer is rendered here */}
      <Footer />
    </>
  );
}

export default MyApp;

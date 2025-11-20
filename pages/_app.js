// /pages/_app.js (FIXED)
import React from 'react';
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import '../styles/global.css'; // Necessary for responsive styles

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header /> 
      {/* This renders the content of the current page (e.g., index.js) */}
      <Component {...pageProps} /> 
      <Footer />
    </>
  );
}

export default MyApp;

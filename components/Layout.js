// /components/Layout.js (Replace the current content)

import React from 'react';
import Navbar from './Navbar'; // Assuming your Navbar component is also in the /components folder

export default function Layout({ children }) {
  return (
    <>
      {/* 1. The Navigation Bar (which you wrote) */}
      <Navbar />
      
      {/* 2. The Main Content Area (This is what was missing!) */}
      <main>
        {children}
      </main>
      
      {/* You can add a Footer here if you have one */}
      {/* <Footer /> */}
    </>
  );
}

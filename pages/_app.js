// /pages/_app.js
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GlobalStoreAssistant from "../components/GlobalStoreAssistant";
import "../styles/global.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
      <GlobalStoreAssistant />
    </>
  );
}

export default MyApp;

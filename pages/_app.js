// /pages/_app.js
import React from "react";
import PageViewTracker from "../components/PageViewTracker";
import SiteBanner from "../components/SiteBanner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GlobalStoreAssistant from "../components/GlobalStoreAssistant";
import "../styles/global.css";
import "leaflet/dist/leaflet.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <PageViewTracker />
      <SiteBanner />
      <Header />
      <Component {...pageProps} />
      <Footer />
      <GlobalStoreAssistant />
    </>
  );
}

export default MyApp;

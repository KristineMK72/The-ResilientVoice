import Head from 'next/head';
import Header from "../components/Header";
import Footer from "../components/Footer";
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Mobile Viewport Fix */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>The Resilient Voice</title>
      </Head>
      
      {/* Your Site Layout */}
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
}

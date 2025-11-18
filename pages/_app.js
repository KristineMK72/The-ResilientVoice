import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";


export default function App({ Component, pageProps }) {
return (
<>
<Header />
<Component {...pageProps} />
<Footer />
</>
);
}
import Head from 'next/head'; // <--- 1. Make sure you import 'Head'
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* 2. Paste the viewport tag here inside Head */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

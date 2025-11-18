import Layout from '../components/Layout';
// NOTE: Assuming you have a styles/globals.css file for basic cleanup
// import '../styles/globals.css'; 

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;

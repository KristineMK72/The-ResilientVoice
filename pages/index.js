import Head from 'next/head';
import ProductGrid from '../components/ProductGrid';

export default function Home() {
  return (
    <>
      <Head>
        <title>The Resilient Voice - Home</title>
        <meta name="description" content="Discover apparel and accessories rooted in faith and resilience." />
        <meta name="keywords" content="faith, resilience, apparel, accessories, e-commerce" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="main">
        <section className="card">
          <h1>Welcome to The Resilient Voice</h1>
          <p>Discover apparel and accessories rooted in faith and resilience.</p>
          <ProductGrid category="all" />
        </section>
      </main>
    </>
  );
}

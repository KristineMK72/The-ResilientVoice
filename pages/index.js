import ProductGrid from "../components/ProductGrid";

export default function Home() {
  return (
    <main className="main">
      <section className="card">
        <h1>Welcome to The Resilient Voice</h1>
        <p>Discover apparel and accessories rooted in faith and resilience.</p>
        <ProductGrid category="all" />
      </section>
    </main>
  );
}

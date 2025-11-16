import ProductGrid from "../components/ProductGrid";

export default function Shop() {
  return (
    <main>
      <h1 className="shop-title">Shop The Resilient Voice</h1>
      <ProductGrid category="all" />
    </main>
  );
}

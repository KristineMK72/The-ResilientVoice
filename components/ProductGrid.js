import Link from "next/link";
import Image from "next/image";

export default function ProductGrid({ category }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch(`/api/printful-products?category=${category}`);
      const data = await res.json();
      setProducts(data);
    }
    fetchProducts();
  }, [category]);

  return (
    <div
      style={{
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      }}
    >
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "1rem",
              textAlign: "center",
              background: "#fafafa",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "200px", marginBottom: "1rem" }}>
              <Image
                src={product.thumbnail || "/fallback.png"}
                alt={product.name}
                fill
                style={{ objectFit: "cover", borderRadius: "8px" }}
                unoptimized={true}
              />
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{product.name}</h3>
            <p style={{ fontWeight: "bold", color: "#9f6baa" }}>${product.price?.toFixed(2)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

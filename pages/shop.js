import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function Shop() {
  // You can later replace these with dynamic API calls if needed
  const collections = [
    {
      slug: "resilience",
      name: "Resilience Collection",
      description: "Wear messages of strength and endurance",
      thumbnail: "https://via.placeholder.com/400x200?text=Resilience", // Replace with Printful CDN URL
    },
    {
      slug: "grace",
      name: "Grace Collection",
      description: "Elegance born from the storm",
      thumbnail: "https://via.placeholder.com/400x200?text=Grace", // Replace with Printful CDN URL
    },
    {
      slug: "warrior-spirit",
      name: "Warrior Spirit Co.",
      description: "Unbroken Series — for the fighter in you",
      thumbnail: "https://via.placeholder.com/400x200?text=Warrior+Spirit", // Replace with Printful CDN URL
    },
  ];

  return (
    <>
      <Head>
        <title>Shop All Collections | The Resilient Voice</title>
        <meta
          name="description"
          content="Resilience, Grace, and Warrior Spirit collections — handcrafted jewelry for survivors."
        />
        <meta property="og:title" content="Shop | The Resilient Voice" />
      </Head>

      <main
        style={{
          padding: "4rem 1rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          Shop Our Collections
        </h1>

        <div
          style={{
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={`/${col.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  border: "2px solid #d4a5e0",
                  borderRadius: "12px",
                  padding: "2rem",
                  textAlign: "center",
                  background: "#faf5ff",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "200px",
                    marginBottom: "1rem",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {/* ✅ Use Printful thumbnail or fallback */}
                  <Image
                    src={
                      col.thumbnail ||
                      "https://via.placeholder.com/400?text=No+Image"
                    }
                    alt={col.name}
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized={true}
                  />
                </div>
                <h2>{col.name}</h2>
                <p>{col.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

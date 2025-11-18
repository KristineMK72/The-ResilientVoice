import Head from "next/head";
import ProductGrid from "../components/ProductGrid";

export default function WarriorSpirit() {
  return (
    <>
      <Head>
        <title>Warrior Spirit Co. Unbroken Series | The Resilient Voice</title>
        <meta name="description" content="Unbreakable jewelry for the fighter in you. Limited Unbroken Series." />
        <meta property="og:title" content="Warrior Spirit Co. | The Resilient Voice" />
      </Head>

      <main style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3rem" }}>Warrior Spirit Co.</h1>
          <p style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#9f6baa" }}>Unbroken Series</p>
          <p style={{ fontSize: "1.4rem", maxWidth: "800px", margin: "1.5rem auto" }}>
            For the fighter in you. Limited pieces that refuse to break.
          </p>
        </div>
        
        {/* We use a wide filter term here to catch all shirts */}
        <ProductGrid category="Warrior" />
      </main>
    </>
  );
}
```

### Next Steps (The Final Debug)

1.  **Save both files.**
2.  Make sure your server is running (`npm run dev`).
3.  Go to the **Warrior Spirit Co.** page in your browser.
4.  **Right-click anywhere** on the page and select **Inspect**.
5.  Click the **Console** tab.

**Look for the `DEBUG:` messages.** It will show you a list of every product name available, like this:

```
DEBUG: Category Filter Is: Warrior
DEBUG: Total Products Found: 8
DEBUG: ALL Product Names (UNFILTERED): ["Resilient Beanie - Accessories collection", "Warrior Spirit Co. Watchman tee", "Unisex seasonal joy t-shirt - Resilience Collection", ...]

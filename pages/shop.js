import Head from 'next/head';
import Link from 'next/link';

export default function Shop() {
  return (
    <>
      <Head>
        <title>Shop | The Resilient Voice</title>
        <meta name="description" content="Storm-narrative inspired jewelry and accessories" />
      </Head>

      <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>
          Shop The Resilient Voice
        </h1>

        {/* Temporary product grid – replace with your real products anytime */}
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <Link href="/warrior-spirit" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '2px solid #d4a5e0', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#faf5ff' }}>
              <div style={{ background: '#e0c8eb', height: '200px', borderRadius: '8px', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.8rem' }}>Warrior Spirit Collection</h2>
              <p>Handcrafted pieces that carry your story</p>
            </div>
          </Link>

          {/* Add more product cards here later */}
          <div style={{ border: '2px dashed #ccc', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#888' }}>
            <p>More collections coming soon…</p>
          </div>
        </div>
      </div>
    </>
  );
}

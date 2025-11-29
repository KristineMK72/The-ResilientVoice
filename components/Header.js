import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <h1>Resilient Voice</h1>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/saved-by-grace">Saved By Grace</Link>
        <Link href="/Patriot">Patriots</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/about">About</Link>
        <Link href="/cart">Cart</Link>
      </nav>
    </header>
  );
}

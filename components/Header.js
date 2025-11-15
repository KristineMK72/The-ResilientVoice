import Link from "next/link";


export default function Header() {
return (
<header className="header">
<h1>Resilient Voice</h1>
<nav>
<Link href="/">Home</Link>
<Link href="/accessories">Accessories</Link>
<Link href="/resilience">Resilience</Link>
<Link href="/grace">Grace</Link>
<Link href="/warrior-spirit">Warrior Spirit</Link>
<Link href="/blog">Blog</Link>
</nav>
</header>
);
}

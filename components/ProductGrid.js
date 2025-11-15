import { useEffect, useState } from "react";
import Image from "next/image";


export default function ProductGrid({ category }) {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);


useEffect(() => {
async function load() {
try {
const res = await fetch("/api/products");
const data = await res.json();
setProducts(data);
} finally {
setLoading(false);
}
}
load();
}, []);


if (loading) return <p>Loading...</p>;


return (
<div className="grid">
{products.map((p) => (
<a key={p.id} href={p.external} target="_blank" className="card">
{p.thumbnail && (
<Image src={p.thumbnail} width={300} height={300} alt={p.name} />
)}
<h3>{p.name}</h3>
</a>
))}
</div>
);
}

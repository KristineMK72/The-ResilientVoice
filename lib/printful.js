const PRINTFUL_BASE = "https://api.printful.com";

export async function printfulFetch(path, init = {}) {
  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Printful error ${res.status}: ${text}`);
  }

  return res.json();
}

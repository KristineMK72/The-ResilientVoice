export async function gootenFetch(path, options = {}) {
  const recipeId = process.env.GOOTEN_RECIPE_ID;

  if (!recipeId) {
    throw new Error("Missing GOOTEN_RECIPE_ID");
  }

  const separator = path.includes("?") ? "&" : "?";
  const url = `https://api.print.io/api/${path}${separator}recipeId=${encodeURIComponent(
    recipeId
  )}`;

  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Gooten returned non-JSON: ${text.slice(0, 300)}`);
  }

  if (!res.ok) {
    throw new Error(
      data?.Message || data?.message || `Gooten API error: ${res.status}`
    );
  }

  return data;
}

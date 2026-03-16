export async function gootenFetch(path, options = {}) {
  const recipeId = process.env.GOOTEN_RECIPE_ID;
  const partnerBillingKey = process.env.GOOTEN_PARTNER_BILLING_KEY;

  if (!recipeId) {
    throw new Error("Missing GOOTEN_RECIPE_ID");
  }

  if (!partnerBillingKey) {
    throw new Error("Missing GOOTEN_PARTNER_BILLING_KEY");
  }

  const separator = path.includes("?") ? "&" : "?";
  const url = `https://api.print.io/api/${path}${separator}recipeId=${encodeURIComponent(
    recipeId
  )}`;

  const res = await fetch(url, {
    method: options.method || "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body:
      options.body ||
      JSON.stringify({
        PartnerBillingKey: partnerBillingKey,
      }),
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Gooten returned non-JSON: ${text.slice(0, 300)}`);
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}

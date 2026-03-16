import { gootenFetch } from "../../../lib/gooten";

export default async function handler(req, res) {
  try {
    const recipeId = process.env.GOOTEN_RECIPE_ID;
    const partnerBillingKey = process.env.GOOTEN_PARTNER_BILLING_KEY;

    const response = await fetch(
      `https://api.print.io/api/products/?recipeId=${recipeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partnerBillingKey,
        }),
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        ok: false,
        error: "Non-JSON response",
        details: text.slice(0, 300),
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Gooten connection successful",
      sample: data?.Products?.slice?.(0, 5) || data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Gooten test failed",
      details: error.message,
    });
  }
}

import { gootenFetch } from "../../../lib/gooten";

export default async function handler(req, res) {
  try {
    const result = await gootenFetch("products");

    return res.status(200).json({
      requestDebug: {
        recipeIdPresent: !!process.env.GOOTEN_RECIPE_ID,
        billingKeyPresent: !!process.env.GOOTEN_PARTNER_BILLING_KEY,
      },
      ok: result.ok,
      status: result.status,
      data: result.data,
      hadError: result.data?.HadError ?? null,
      errors: result.data?.Errors ?? null,
      errorReferenceCode: result.data?.ErrorReferenceCode ?? null,
      message: result.data?.Message ?? null,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Gooten test failed",
      details: error.message,
    });
  }
}

import { gootenFetch } from "../../../lib/gooten";

export default async function handler(req, res) {
  try {
    const result = await gootenFetch("products");

    return res.status(200).json({
      ok: result.ok,
      status: result.status,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Gooten test failed",
      details: error.message,
    });
  }
}

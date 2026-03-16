// /pages/api/gooten/test.js
import { gootenFetch } from "../../../lib/gooten";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const data = await gootenFetch("products");

    return res.status(200).json({
      ok: true,
      message: "Gooten connection successful",
      sample:
        data?.Products?.slice?.(0, 3) ||
        data?.products?.slice?.(0, 3) ||
        data,
    });
  } catch (error) {
    console.error("gooten test error:", error);

    return res.status(500).json({
      ok: false,
      error: "Gooten connection failed",
      details: error?.message || "Unknown error",
    });
  }
}

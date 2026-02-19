// pages/api/test-supabase.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Optional: allow GET or POST
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const testSessionId = `TEST_${Date.now()}`;

    // Minimal insert payload (should match your existing schema)
    const payload = {
      stripe_session_id: testSessionId,
      fulfillment_status: "test",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase insert failed",
        testSessionId,
        payload,
        error, // includes error.message + details
      });
    }

    return res.status(200).json({
      success: true,
      message: "Insert successful",
      testSessionId,
      inserted: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err?.message || String(err),
    });
  }
}

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Simple test query
    const { data, error } = await supabase
      .from("orders")
      .select("stripe_session_id")
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supabase connection successful",
      sample: data,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

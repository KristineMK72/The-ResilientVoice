import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const response = await resend.emails.send({
      from: "Grit & Grace <orders@gritandgrace.buzz>",
      to: "heidijo36@hotmail.com",
      subject: "Heidi, thank you for your Grit & Grace order 💖",
      html: `
      <div style="font-family: Arial, sans-serif; background-color:#f9f7f4; padding:40px;">
        <div style="max-width:600px; margin:0 auto; background:white; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <h2 style="margin-top:0; color:#1F2937;">Thank you, Heidi 💖</h2>

          <p style="color:#4B5563; font-size:16px; line-height:1.6;">
            Your order means more than just a purchase — it supports the mission behind Grit & Grace.
          </p>

          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

          <h3 style="color:#1F2937;">Order Details</h3>

          <p style="margin:8px 0; color:#374151;">
            <strong>Item:</strong><br/>
            The Climb / Unforgettable heavyweight long-sleeve shirt<br/>
            Light Green — Size Large
          </p>

          <p style="margin:8px 0; color:#374151;">
            <strong>Total:</strong> $38.74
          </p>

          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

          <h3 style="color:#1F2937;">Shipping To</h3>

          <p style="margin:8px 0; color:#374151;">
            Heidi Fairchild<br/>
            6072 Fairveiw Rd<br/>
            Baxter, MN 56425
          </p>

          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

          <p style="color:#4B5563; font-size:16px; line-height:1.6;">
            Your order is now in fulfillment and will be on its way soon.  
            We’ll send you another update once it ships 🚚
          </p>

          <p style="margin-top:30px; color:#4B5563;">
            With love,<br/>
            <strong>Kristine</strong><br/>
            Grit & Grace ❤️
          </p>

        </div>

        <p style="text-align:center; margin-top:20px; font-size:12px; color:#9CA3AF;">
          gritandgrace.buzz
        </p>
      </div>
      `,
    });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error("❌ Email send failed:", err);
    return res.status(500).json({ error: err.message });
  }
}

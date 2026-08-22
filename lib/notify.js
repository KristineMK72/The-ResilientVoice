// lib/notify.js — shared mail helper (same SMTP as email-signup)
import nodemailer from "nodemailer";

function money(cents, currency = "usd") {
  if (cents == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "usd").toUpperCase(),
    }).format(Number(cents) / 100);
  } catch {
    return `$${(Number(cents) / 100).toFixed(2)}`;
  }
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Email YOU when a paid order lands (so you don't have to live in Stripe).
 * Uses EMAIL_TO / ORDER_NOTIFY_EMAIL, falls back to SMTP_USER.
 * Never throws — logs and returns false on failure.
 */
export async function notifyOwnerNewOrder({
  sessionId,
  customerName,
  customerEmail,
  amountTotal,
  currency,
  items = [],
  fulfillmentStatus,
  shipSummary,
}) {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn(
        "[notify] SMTP not configured — skip order email (set SMTP_HOST/PORT/USER/PASS)"
      );
      return false;
    }

    const to =
      process.env.ORDER_NOTIFY_EMAIL ||
      process.env.EMAIL_TO ||
      process.env.SMTP_USER;
    const from =
      process.env.EMAIL_FROM || `Grit & Grace Orders <${process.env.SMTP_USER}>`;

    const lines = (items || [])
      .map((i) => {
        const qty = i.quantity || 1;
        const name = i.description || i.product_name || i.name || "Item";
        return `  • ${qty}× ${name}`;
      })
      .join("\n");

    const text = [
      "New paid order on Grit & Grace",
      "",
      `Customer: ${customerName || "—"}`,
      `Email: ${customerEmail || "—"}`,
      `Total: ${money(amountTotal, currency)}`,
      `Fulfillment: ${fulfillmentStatus || "pending"}`,
      shipSummary ? `Ship to: ${shipSummary}` : null,
      "",
      "Items:",
      lines || "  (see Stripe/session)",
      "",
      `Stripe session: ${sessionId}`,
      `Time: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    await transporter.sendMail({
      from,
      to,
      subject: `Order paid · ${money(amountTotal, currency)} · ${customerName || customerEmail || "customer"}`,
      text,
    });

    console.log("[notify] order email sent to", to);
    return true;
  } catch (err) {
    console.error("[notify] order email failed:", err.message || err);
    return false;
  }
}

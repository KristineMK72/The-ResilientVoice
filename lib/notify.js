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

function itemLines(items) {
  return (items || [])
    .map((i) => {
      const qty = i.quantity || 1;
      const name = i.description || i.product_name || i.name || "Item";
      return `  • ${qty}× ${name}`;
    })
    .join("\n");
}

/**
 * Email YOU when a paid order lands.
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
      console.warn("[notify] SMTP not configured — skip owner order email");
      return false;
    }

    const to =
      process.env.ORDER_NOTIFY_EMAIL ||
      process.env.EMAIL_TO ||
      process.env.SMTP_USER;
    const from =
      process.env.EMAIL_FROM || `Grit & Grace Orders <${process.env.SMTP_USER}>`;

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
      itemLines(items) || "  (see Stripe/session)",
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

    console.log("[notify] owner order email sent to", to);
    return true;
  } catch (err) {
    console.error("[notify] owner order email failed:", err.message || err);
    return false;
  }
}

/**
 * Thank-you / confirmation to the customer after paid checkout.
 */
export async function notifyCustomerOrderReceived({
  customerName,
  customerEmail,
  amountTotal,
  currency,
  items = [],
  shipSummary,
}) {
  try {
    const to = (customerEmail || "").toString().trim();
    if (!to || !to.includes("@")) return false;

    const transporter = getTransporter();
    if (!transporter) {
      console.warn("[notify] SMTP not configured — skip customer order email");
      return false;
    }

    const from =
      process.env.EMAIL_FROM || `Grit & Grace <${process.env.SMTP_USER}>`;
    const name = (customerName || "friend").toString().split(" ")[0] || "friend";
    const total = money(amountTotal, currency);
    const lines = itemLines(items) || "  • Your items are being prepared";

    const text = [
      `Hi ${name},`,
      "",
      "Thank you for your order from Grit & Grace.",
      "We received your payment and your order is in motion.",
      "",
      `Order total: ${total}`,
      shipSummary ? `Shipping to: ${shipSummary}` : null,
      "",
      "Items:",
      lines,
      "",
      "You’ll get tracking from our print partner when it ships.",
      "If you have questions, just reply to this email.",
      "",
      "With grit and grace,",
      "— The Grit & Grace team",
      "https://gritandgrace.buzz",
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 560px;">
        <h2 style="margin-bottom: 8px;">Thank you for your order</h2>
        <p>Hi ${name},</p>
        <p>We received your payment and your <strong>Grit &amp; Grace</strong> order is in motion.</p>
        <p><strong>Total:</strong> ${total}</p>
        ${shipSummary ? `<p><strong>Shipping to:</strong> ${shipSummary}</p>` : ""}
        <p><strong>Items</strong></p>
        <pre style="font-family: inherit; white-space: pre-wrap;">${lines}</pre>
        <p>You’ll get tracking from our print partner when it ships. Questions? Reply to this email.</p>
        <p style="margin-top: 24px;">With grit and grace,<br/><strong>— The Grit &amp; Grace team</strong></p>
        <p><a href="https://gritandgrace.buzz">gritandgrace.buzz</a></p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: `We got your order · Grit & Grace · ${total}`,
      text,
      html,
    });

    console.log("[notify] customer order email sent to", to);
    return true;
  } catch (err) {
    console.error("[notify] customer order email failed:", err.message || err);
    return false;
  }
}

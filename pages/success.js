// pages/success.js
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [session, setSession] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (!sessionId) {
        setError("No order information found. Please check your email for confirmation.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/get-checkout-session?session_id=${sessionId}`);
        if (!res.ok) throw new Error(`Failed to load order details (status ${res.status})`);

        const data = await res.json();
        setSession(data.session || null);
        setOrderDetails(data.orderDetails || null);
      } catch (err) {
        console.error("Error fetching session:", err);
        setError(
          "Something went wrong loading your order. Don’t worry — your payment succeeded! Check your email for details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Loading your order details...</h2>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", maxWidth: 600, margin: "0 auto" }}>
        <h1>Order Received! 🎉</h1>
        <p style={{ color: "#e74c3c", fontWeight: "bold" }}>{error}</p>
        <p>We’ve got your payment — you’ll receive a confirmation email shortly with your order number and next steps.</p>
        <p>
          <strong>Tip:</strong> Check your spam/junk folder if you don’t see it soon.
        </p>
        <a href="/" style={{ color: "#3498db", textDecoration: "underline" }}>
          Back to shop →
        </a>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1>Thank You! ❤️</h1>
        <p>Your purchase was successful. We’ll send order details to your email soon.</p>
        <a href="/" style={{ color: "#3498db", textDecoration: "underline" }}>
          Continue shopping →
        </a>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem", maxWidth: 700, margin: "0 auto" }}>
      <h1>🎉 Thank You for Your Order! ❤️</h1>
      <p style={{ fontSize: "1.2rem", margin: "1rem 0" }}>
        Your payment was successful, and your support means the world — it helps us give back to non-profits!
      </p>

      <div style={{ background: "#f8f9fa", borderRadius: 12, padding: "1.5rem", margin: "2rem 0" }}>
        <h2 style={{ marginTop: 0 }}>Order Summary</h2>
        <p><strong>Order ID:</strong> {session.id}</p>
        <p><strong>Email:</strong> {session.customer_details?.email || "Not provided"}</p>
        {session.amount_total != null && (
          <p>
            <strong>Total Paid:</strong> ${(session.amount_total / 100).toFixed(2)}{" "}
            {session.currency?.toUpperCase()}
          </p>
        )}
        {session.shipping_details?.address && (
          <p>
            <strong>Shipping to:</strong><br />
            {session.shipping_details.name}<br />
            {session.shipping_details.address.line1}<br />
            {session.shipping_details.address.line2 ? `${session.shipping_details.address.line2}\n` : ""}
            {session.shipping_details.address.city}, {session.shipping_details.address.state}{" "}
            {session.shipping_details.address.postal_code}
          </p>
        )}
      </div>

      {orderDetails?.items?.length > 0 && (
        <div style={{ margin: "2rem 0" }}>
          <h3>Your Items</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {orderDetails.items.map((item, i) => (
              <li key={i} style={{ margin: "0.5rem 0" }}>
                {item.quantity} × {item.product_name || "Item"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ fontSize: "1.1rem", margin: "2rem 0" }}>
        <strong>Next steps:</strong> We’ll email your confirmation right away. You’ll get another update when your items ship.
      </p>

      <div style={{ marginTop: "3rem" }}>
        <a
          href="/"
          style={{
            display: "inline-block",
            background: "#3498db",
            color: "white",
            padding: "0.8rem 1.8rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Back to Shop →
        </a>
      </div>
    </div>
  );
}

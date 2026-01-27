// pages/success.js
import { useEffect, useMemo, useState } from "react";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "white",
          borderRadius: 14,
          padding: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "transparent",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 10 }}>{children}</div>

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              background: "#3498db",
              color: "white",
              border: "none",
              padding: "0.65rem 1rem",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Awesome 🎉
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  const [session, setSession] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const sessionIdFromUrl = useMemo(() => {
    if (typeof window === "undefined") return null;
    const urlParams = new URLSearchParams(window.location.search);
    // accept either session_id or checkout_session_id if you ever change naming
    return urlParams.get("session_id") || urlParams.get("checkout_session_id");
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionId = sessionIdFromUrl;

      if (!sessionId) {
        setError("No order information found. Please check your email for confirmation.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error(`Failed to load order details (status ${res.status})`);

        const data = await res.json();
        const s = data.session || null;

        setSession(s);
        setOrderDetails(data.orderDetails || null);

        // Show popup once per session id
        if (s?.id) {
          const key = `success_popup_seen_${s.id}`;
          const alreadySeen = window.localStorage.getItem(key);
          if (!alreadySeen) {
            setShowPopup(true);
            window.localStorage.setItem(key, "1");
          }
        } else {
          // If we have no session object but call succeeded, still show a gentle popup once
          const key = `success_popup_seen_${sessionId}`;
          const alreadySeen = window.localStorage.getItem(key);
          if (!alreadySeen) {
            setShowPopup(true);
            window.localStorage.setItem(key, "1");
          }
        }
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
  }, [sessionIdFromUrl]);

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

  const addr = session.shipping_details?.address;

  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem", maxWidth: 700, margin: "0 auto" }}>
      <Modal
        open={showPopup}
        title="Payment successful 🎉"
        onClose={() => setShowPopup(false)}
      >
        <p style={{ marginTop: 0 }}>
          Thank you for your order{session.customer_details?.email ? `, ${session.customer_details.email}` : ""}!
        </p>
        <p style={{ marginBottom: 0 }}>
          We’re sending your confirmation email now. ❤️
        </p>
      </Modal>

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

        {addr && (
          <p>
            <strong>Shipping to:</strong><br />
            {session.shipping_details?.name || ""}<br />
            {addr.line1}<br />
            {addr.line2 ? (<>{addr.line2}<br /></>) : null}
            {addr.city}, {addr.state} {addr.postal_code}
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

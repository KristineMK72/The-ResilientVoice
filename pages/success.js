// pages/success.js
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/get-checkout-session?session_id=${sessionId}`);
        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (loading) return <p>Loading your order...</p>;

  if (!session) return <p>No order found.</p>;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>🎉 Thank you for your order!</h1>
      <p>Your payment was successful.</p>
      <p><strong>Order ID:</strong> {session.id}</p>
      <p><strong>Email:</strong> {session.customer_details?.email}</p>
      <p>We’ll send you updates as your items ship.</p>
    </div>
  );
}

<button
  onClick={async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ cart }),
      headers: { "Content-Type": "application/json" },
    });
    const { url } = await res.json();
    window.location = url;
  }}
  style={{
    padding: "1.6rem 4rem",
    background: "linear-gradient(135deg, #9f6baa, #c084fc)",
    color: "white",
    border: "none",
    borderRadius: "20px",
    fontSize: "1.8rem",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(159,107,170,0.4)",
  }}
>
  Checkout with Stripe
</button>

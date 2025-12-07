import { useState } from "react";

export default function AdminGiving() {
  const [form, setForm] = useState({
    date: "",
    source: "",
    totalSales: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");

    const totalSalesNum = Number(form.totalSales || 0);
    const totalGiving = totalSalesNum * 0.1;
    const split = totalGiving / 4;

    const payload = {
      date: form.date,
      source: form.source || "Manual",
      totalSales: totalSalesNum,
      totalGiving,
      homelessnessAmount: split,
      mentalHealthAmount: split,
      suicidePreventionAmount: split,
      veteranSupportAmount: split,
    };

    try {
      const res = await fetch("/api/giving/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save record");

      setStatus("success");
      setForm({ date: "", source: "", totalSales: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "1rem 0",
        background: "linear-gradient(145deg, #181d33 0%, #30264a 100%)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          maxWidth: "700px",
          width: "90%",
          padding: "3rem",
          margin: "80px 0",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
        }}
      >
        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: "900",
            marginBottom: "1.5rem",
            color: "#b0c4de",
            textAlign: "center",
          }}
        >
          Admin: Add Giving Record
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.3rem" }}>
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid #b0c4de",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.3rem" }}>
              Source (optional)
            </label>
            <input
              type="text"
              name="source"
              value={form.source}
              onChange={handleChange}
              placeholder="Shopify, Etsy, Manual, etc."
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid #b0c4de",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.3rem" }}>
              Total Sales (for this period)
            </label>
            <input
              type="number"
              name="totalSales"
              value={form.totalSales}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid #b0c4de",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "saving"}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.8rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#ffc0cb",
              color: "#181d33",
              fontWeight: "bold",
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            {status === "saving" ? "Saving..." : "Save Giving Record"}
          </button>
        </form>

        {status === "success" && (
          <p style={{ marginTop: "1rem", color: "#90ee90" }}>
            Giving record saved successfully.
          </p>
        )}
        {status === "error" && (
          <p style={{ marginTop: "1rem", color: "#ff9999" }}>
            There was an error saving the record.
          </p>
        )}
      </section>
    </main>
  );
}

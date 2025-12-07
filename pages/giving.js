import { useEffect, useState } from "react";

export default function GivingDashboard() {
  const [salesInput, setSalesInput] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const causes = [
    {
      key: "homelessnessAmount",
      label: "National Coalition for the Homeless",
      icon: "🏠",
      url: "https://www.nationalhomeless.org/",
    },
    {
      key: "mentalHealthAmount",
      label: "NAMI (National Alliance on Mental Illness)",
      icon: "💚",
      url: "https://www.nami.org/",
    },
    {
      key: "suicidePreventionAmount",
      label: "American Foundation for Suicide Prevention",
      icon: "💙",
      url: "https://afsp.org/",
    },
    {
      key: "veteranSupportAmount",
      label: "Wounded Warrior Project",
      icon: "🎖️",
      url: "https://www.woundedwarriorproject.org/",
    },
  ];

  // Fetch real giving data from backend
  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await fetch("/api/giving/summary");
        if (!res.ok) {
          throw new Error("Failed to load giving summary");
        }
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError("We couldn't load live giving data right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const simulatedGiving = salesInput ? salesInput * 0.1 : 0;

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
          maxWidth: "900px",
          width: "90%",
          padding: "4rem 3rem",
          margin: "80px 0",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
        }}
      >
        {/* TITLE */}
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "900",
            marginBottom: "1.5rem",
            color: "#b0c4de",
            textAlign: "center",
          }}
        >
          Giving Back Dashboard
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            lineHeight: "1.6",
            marginBottom: "1.5rem",
          }}
        >
          Grit & Grace donates{" "}
          <strong style={{ color: "#ffc0cb" }}>10% of every sale</strong> to
          national organizations focused on homelessness, mental health, suicide
          prevention, and veteran support. This page shares both our{" "}
          <strong>actual giving so far</strong> and a{" "}
          <strong>simple calculator</strong> to see the impact of future sales.
        </p>

        {/* LIVE SUMMARY */}
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "12px",
            background: "rgba(0, 0, 0, 0.35)",
            marginBottom: "2.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
              color: "#ffc0cb",
            }}
          >
            Live Giving Summary
          </h2>

          {loading && <p>Loading live giving totals…</p>}

          {error && <p style={{ color: "#ff9999" }}>{error}</p>}

          {summary && !loading && !error && (
            <>
              <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                Total Sales Counted:{" "}
                <strong>${summary.totalSales.toFixed(2)}</strong>
              </p>
              <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                Total Given So Far:{" "}
                <strong style={{ color: "#ffc0cb" }}>
                  ${summary.totalGiving.toFixed(2)}
                </strong>
              </p>

              <h3
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  color: "#b0c4de",
                }}
              >
                Distribution Across Causes
              </h3>

              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  fontSize: "1.05rem",
                }}
              >
                {causes.map((cause) => (
                  <li key={cause.key} style={{ marginBottom: "0.8rem" }}>
                    {cause.icon} <strong>{cause.label}</strong> — $
                    {summary[cause.key].toFixed(2)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* CALCULATOR */}
        <div
          style={{
            padding: "1.5rem",
            borderRadius: "12px",
            background: "rgba(0, 0, 0, 0.35)",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
              color: "#ffc0cb",
            }}
          >
            Future Impact Calculator
          </h2>

          <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            Enter a sales amount to see how much would be given back — and how
            it could be shared across each organization.
          </p>

          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <input
              type="number"
              min="0"
              placeholder="Enter total sales amount"
              value={salesInput}
              onChange={(e) => setSalesInput(e.target.value)}
              style={{
                padding: "0.8rem 1rem",
                width: "80%",
                maxWidth: "400px",
                borderRadius: "8px",
                border: "1px solid #b0c4de",
                fontSize: "1.1rem",
              }}
            />
          </div>

          <h3
            style={{
              fontSize: "1.6rem",
              marginBottom: "0.5rem",
              color: "#b0c4de",
              textAlign: "center",
            }}
          >
            If sales are: ${salesInput || "0.00"}
          </h3>
          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            10% Giving:{" "}
            <strong style={{ color: "#ffc0cb" }}>
              ${simulatedGiving.toFixed(2)}
            </strong>
          </p>

          <h4
            style={{
              fontSize: "1.3rem",
              marginBottom: "1rem",
              color: "#b0c4de",
            }}
          >
            Split Evenly Across Causes:
          </h4>

          <ul
            style={{
              listStyle: "none",
              paddingLeft: 0,
              fontSize: "1.05rem",
            }}
          >
            {causes.map((cause) => (
              <li key={cause.key} style={{ marginBottom: "0.6rem" }}>
                {cause.icon} <strong>{cause.label}</strong> — $
                {(simulatedGiving / causes.length || 0).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>

        <p
          style={{
            marginTop: "2rem",
            fontSize: "1.1rem",
            textAlign: "center",
            color: "#b0c4de",
          }}
        >
          Every purchase becomes an investment in hope, healing, and national
          resilience.
        </p>
      </section>
    </main>
  );
}

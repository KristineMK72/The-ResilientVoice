// pages/giving-dashboard.js
"use client";

import { useEffect, useMemo, useState } from "react";

export default function GivingDashboard() {
  const [salesInput, setSalesInput] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const causes = useMemo(
    () => [
      {
        key: "sexualAssaultServicesAmount",
        label: "Sexual Assault Services Minnesota",
        shortLabel: "SASMN",
        icon: "🕊️",
        url: "https://www.sasmn.org/",
        description: "Support, resources, and healing for survivors of sexual assault.",
      },
      {
        key: "lighthouseProjectAmount",
        label: "The Lighthouse Project",
        shortLabel: "Lighthouse Project",
        icon: "💡",
        url: "https://www.lhpmn.org/",
        description: "Mental health awareness and support for youth in the Brainerd Lakes Area.",
      },
      {
        key: "restorativeJusticeAmount",
        label: "Lakes Area Restorative Justice Project",
        shortLabel: "LARJP",
        icon: "🤝",
        url: "https://larjp.org/",
        description: "Community-based restorative practices that foster accountability and healing.",
      },
    ],
    []
  );

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/giving/summary");
        if (!res.ok) throw new Error("Failed to load giving summary");

        const data = await res.json();

        const safeData = {
          totalSales: Number(data?.totalSales || 0),
          totalGiving: Number(data?.totalGiving || 0),
        };

        causes.forEach((cause) => {
          safeData[cause.key] = Number(data?.[cause.key] || 0);
        });

        setSummary(safeData);
      } catch (err) {
        console.error(err);
        setError("We couldn't load live giving data right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [causes]);

  const parsedSales = Number.parseFloat(salesInput);
  const safeSales = Number.isFinite(parsedSales) ? parsedSales : 0;
  const simulatedGiving = safeSales * 0.1;
  const evenSplitAmount = simulatedGiving / causes.length;

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

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
          maxWidth: "960px",
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
            lineHeight: "1.7",
            marginBottom: "1.5rem",
          }}
        >
          Grit & Grace donates{" "}
          <strong style={{ color: "#ffc0cb" }}>10% of every sale</strong> to
          organizations making a difference right here in the Brainerd Lakes
          Area. This dashboard highlights both our{" "}
          <strong>actual giving so far</strong> and a{" "}
          <strong>simple calculator</strong> to show the impact of future sales.
        </p>

        <div
          style={{
            padding: "1.5rem",
            borderRadius: "12px",
            background: "rgba(0, 0, 0, 0.35)",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "1rem",
              color: "#ffc0cb",
            }}
          >
            Our Local Giving Partners
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            {causes.map((cause) => (
              <a
                key={cause.key}
                href={cause.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#ffffff",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "1rem",
                  transition: "transform 0.2s ease",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  {cause.icon}
                </div>
                <div
                  style={{
                    fontWeight: "800",
                    color: "#b0c4de",
                    marginBottom: "0.4rem",
                  }}
                >
                  {cause.label}
                </div>
                <div
                  style={{
                    fontSize: "0.98rem",
                    lineHeight: "1.5",
                    color: "#e8e8e8",
                  }}
                >
                  {cause.description}
                </div>
              </a>
            ))}
          </div>
        </div>

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
                <strong>{formatCurrency(summary.totalSales)}</strong>
              </p>

              <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                Total Given So Far:{" "}
                <strong style={{ color: "#ffc0cb" }}>
                  {formatCurrency(summary.totalGiving)}
                </strong>
              </p>

              <h3
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  color: "#b0c4de",
                }}
              >
                Distribution Across Local Causes
              </h3>

              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  fontSize: "1.05rem",
                  margin: 0,
                }}
              >
                {causes.map((cause) => (
                  <li key={cause.key} style={{ marginBottom: "0.85rem" }}>
                    {cause.icon} <strong>{cause.label}</strong> —{" "}
                    {formatCurrency(summary[cause.key])}{" "}
                    <a
                      href={cause.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#b0c4de",
                        marginLeft: "8px",
                        textDecoration: "underline",
                      }}
                    >
                      Visit
                    </a>
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
            it could be shared across each local organization.
          </p>

          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <input
              type="number"
              min="0"
              step="0.01"
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
            If sales are: {formatCurrency(safeSales)}
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
              {formatCurrency(simulatedGiving)}
            </strong>
          </p>

          <h4
            style={{
              fontSize: "1.3rem",
              marginBottom: "1rem",
              color: "#b0c4de",
            }}
          >
            Split Evenly Across Causes ({causes.length} ways):
          </h4>

          <ul
            style={{
              listStyle: "none",
              paddingLeft: 0,
              fontSize: "1.05rem",
              margin: 0,
            }}
          >
            {causes.map((cause) => (
              <li key={cause.key} style={{ marginBottom: "0.6rem" }}>
                {cause.icon} <strong>{cause.label}</strong> —{" "}
                {formatCurrency(evenSplitAmount)}
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
            lineHeight: "1.6",
          }}
        >
          Every purchase becomes an investment in hope, healing, accountability,
          and stronger community support right here in Brainerd, Minnesota.
        </p>
      </section>
    </main>
  );
}

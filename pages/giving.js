"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

export default function GivingPage() {
  const [salesInput, setSalesInput] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [causeGroup, setCauseGroup] = useState("local");
  const [selectedCauseKey, setSelectedCauseKey] = useState("");
  const [donationInput, setDonationInput] = useState("");
  const [donationMessage, setDonationMessage] = useState("");

  const pageTitle = "Giving Back Dashboard | Grit & Grace";
  const pageDescription =
    "See how Grit & Grace gives back through local giving, optional customer donations, and support for causes that bring healing, hope, and restoration.";
  const pageUrl = "https://gritandgrace.buzz/giving";
  const previewImage = "https://gritandgrace.buzz/gritgiving.png";

  const causes = useMemo(
    () => [
      {
        group: "local",
        key: "sexualAssaultServicesAmount",
        label: "Sexual Assault Services Minnesota",
        shortLabel: "SASMN",
        icon: "🕊️",
        url: "https://www.sasmn.org/",
        description:
          "Support, resources, and healing for survivors of sexual assault.",
      },
      {
        group: "local",
        key: "lighthouseProjectAmount",
        label: "The Lighthouse Project",
        shortLabel: "Lighthouse Project",
        icon: "💡",
        url: "https://www.lhpmn.org/",
        description:
          "Mental health awareness and support for youth in the Brainerd Lakes Area.",
      },
      {
        group: "local",
        key: "restorativeJusticeAmount",
        label: "Lakes Area Restorative Justice Project",
        shortLabel: "LARJP",
        icon: "🤝",
        url: "https://larjp.org/",
        description:
          "Community-based restorative practices that foster accountability and healing.",
      },
      {
        group: "national",
        key: "homelessCoalitionAmount",
        label: "National Coalition for the Homeless",
        shortLabel: "NCH",
        icon: "🏠",
        url: "https://nationalhomeless.org/",
        description:
          "Advocacy, education, and support around homelessness and housing insecurity.",
      },
      {
        group: "national",
        key: "woundedWarriorAmount",
        label: "Wounded Warrior Project",
        shortLabel: "WWP",
        icon: "🇺🇸",
        url: "https://www.woundedwarriorproject.org/",
        description:
          "Support for wounded veterans, service members, and their families.",
      },
      {
        group: "national",
        key: "suicidePreventionAmount",
        label: "988 Suicide & Crisis Lifeline",
        shortLabel: "988 Lifeline",
        icon: "💚",
        url: "https://988lifeline.org/",
        description:
          "Crisis support, suicide prevention, and immediate connection to help.",
      },
    ],
    []
  );

  const localCauses = useMemo(
    () => causes.filter((cause) => cause.group === "local"),
    [causes]
  );

  const nationalCauses = useMemo(
    () => causes.filter((cause) => cause.group === "national"),
    [causes]
  );

  const filteredCauses = useMemo(
    () => causes.filter((cause) => cause.group === causeGroup),
    [causes, causeGroup]
  );

  useEffect(() => {
    if (filteredCauses.length > 0) {
      const stillValid = filteredCauses.some(
        (cause) => cause.key === selectedCauseKey
      );
      if (!stillValid) {
        setSelectedCauseKey(filteredCauses[0].key);
      }
    }
  }, [filteredCauses, selectedCauseKey]);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/giving/summary");
        if (!res.ok) {
          throw new Error("Failed to load giving summary");
        }

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

  const parsedDonation = Number.parseFloat(donationInput);
  const safeDonation = Number.isFinite(parsedDonation) ? parsedDonation : 0;

  const simulatedGiving = safeSales * 0.1;
  const evenSplitLocalAmount =
    localCauses.length > 0 ? simulatedGiving / localCauses.length : 0;

  const selectedCause =
    causes.find((cause) => cause.key === selectedCauseKey) || null;

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  const impactTotal = simulatedGiving + safeDonation;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Grit & Grace" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={previewImage} />
        <meta property="og:image:secure_url" content={previewImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Grit & Grace Giving Back Dashboard preview image"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={previewImage} />
      </Head>

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
            maxWidth: "980px",
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
            organizations making a difference. Our featured local partners stay
            at the heart of this mission, and customers can also choose to add
            an optional donation to trusted local or national causes.
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
              Featured Local Giving Partners
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
              }}
            >
              {localCauses.map((cause) => (
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
              Optional National Giving Partners
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
              }}
            >
              {nationalCauses.map((cause) => (
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
                  Distribution Across Featured Local Causes
                </h3>

                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: 0,
                    fontSize: "1.05rem",
                    margin: 0,
                  }}
                >
                  {localCauses.map((cause) => (
                    <li key={cause.key} style={{ marginBottom: "0.85rem" }}>
                      {cause.icon} <strong>{cause.label}</strong> —{" "}
                      {formatCurrency(summary[cause.key])}
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
              Add Your Own Donation
            </h2>

            <p style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>
              Want to give a little extra? Choose whether your optional donation
              goes to a featured local partner or one of our national giving
              partners.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "700",
                    color: "#b0c4de",
                  }}
                >
                  Donation destination
                </label>
                <select
                  value={causeGroup}
                  onChange={(e) => setCauseGroup(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #b0c4de",
                    fontSize: "1rem",
                    background: "#fff",
                    color: "#111",
                  }}
                >
                  <option value="local">Featured local partners</option>
                  <option value="national">National partners</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "700",
                    color: "#b0c4de",
                  }}
                >
                  Choose an organization
                </label>
                <select
                  value={selectedCauseKey}
                  onChange={(e) => setSelectedCauseKey(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #b0c4de",
                    fontSize: "1rem",
                    background: "#fff",
                    color: "#111",
                  }}
                >
                  {filteredCauses.map((cause) => (
                    <option key={cause.key} value={cause.key}>
                      {cause.icon} {cause.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "700",
                    color: "#b0c4de",
                  }}
                >
                  Optional donation amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter donation amount"
                  value={donationInput}
                  onChange={(e) => setDonationInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #b0c4de",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "700",
                  color: "#b0c4de",
                }}
              >
                Optional dedication or note
              </label>
              <textarea
                placeholder="In honor of someone, in memory of someone, or simply why this cause matters to you..."
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #b0c4de",
                  fontSize: "1rem",
                  resize: "vertical",
                }}
              />
            </div>

            {selectedCause && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p style={{ margin: 0, fontSize: "1.05rem" }}>
                  Supporting:{" "}
                  <strong style={{ color: "#ffc0cb" }}>
                    {selectedCause.icon} {selectedCause.label}
                  </strong>
                </p>
                <p
                  style={{
                    marginTop: "0.5rem",
                    marginBottom: 0,
                    color: "#e8e8e8",
                    lineHeight: "1.5",
                  }}
                >
                  {selectedCause.description}
                </p>
              </div>
            )}
          </div>

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
              Enter a sales amount to see how much Grit & Grace would give back,
              plus how an optional customer donation could increase the impact.
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
                marginBottom: "0.75rem",
                textAlign: "center",
              }}
            >
              10% Giving from Grit & Grace:{" "}
              <strong style={{ color: "#ffc0cb" }}>
                {formatCurrency(simulatedGiving)}
              </strong>
            </p>

            <p
              style={{
                fontSize: "1.15rem",
                marginBottom: "0.75rem",
                textAlign: "center",
              }}
            >
              Optional Customer Donation:{" "}
              <strong style={{ color: "#b0c4de" }}>
                {formatCurrency(safeDonation)}
              </strong>
            </p>

            <p
              style={{
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              Combined Impact:{" "}
              <strong style={{ color: "#ffc0cb" }}>
                {formatCurrency(impactTotal)}
              </strong>
            </p>

            <h4
              style={{
                fontSize: "1.3rem",
                marginBottom: "1rem",
                color: "#b0c4de",
              }}
            >
              10% Split Across Featured Local Partners ({localCauses.length}{" "}
              ways):
            </h4>

            <ul
              style={{
                listStyle: "none",
                paddingLeft: 0,
                fontSize: "1.05rem",
                margin: 0,
              }}
            >
              {localCauses.map((cause) => (
                <li key={cause.key} style={{ marginBottom: "0.6rem" }}>
                  {cause.icon} <strong>{cause.label}</strong> —{" "}
                  {formatCurrency(evenSplitLocalAmount)}
                </li>
              ))}
            </ul>

            {selectedCause && safeDonation > 0 && (
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p style={{ margin: 0, fontSize: "1.05rem" }}>
                  Additional direct donation to{" "}
                  <strong style={{ color: "#ffc0cb" }}>
                    {selectedCause.label}
                  </strong>
                  : {formatCurrency(safeDonation)}
                </p>
                {donationMessage.trim() && (
                  <p
                    style={{
                      marginTop: "0.6rem",
                      marginBottom: 0,
                      color: "#e8e8e8",
                      fontStyle: "italic",
                    }}
                  >
                    “{donationMessage.trim()}”
                  </p>
                )}
              </div>
            )}
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
            Every purchase becomes an investment in hope, healing,
            accountability, patriotism with purpose, and stronger support for
            people who need it most.
          </p>
        </section>
      </main>
    </>
  );
}

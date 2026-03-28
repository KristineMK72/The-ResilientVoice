// pages/admin/scam-reports.js
"use client";

import { useEffect, useState } from "react";

const EMPTY_FORM = {
  phone_number: "",
  scammer_name: "",
  platform: "Facebook Marketplace",
  item_referenced: "",
  message_text: "",
  notes: "",
  ip: "",
  city: "",
  region: "",
  country: "US",
  reported_to_carrier: false,
  reported_to_platform: false,
  reported_to_ftc: false,
};

export default function ScamReportsPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [message, setMessage] = useState("");

  async function loadReports() {
    try {
      setLoadingReports(true);
      const res = await fetch("/api/report-scam");
      const json = await res.json();
      if (json.success) setReports(json.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/report-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save report");
      }

      setMessage("Scam report saved.");
      setForm(EMPTY_FORM);
      await loadReports();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <h1>Scam Reports</h1>
      <p className="intro">
        Log scam attempts tied to texts, fake Apple Pay messages, Marketplace buyers, or suspicious visitors.
      </p>

      <form onSubmit={handleSubmit} className="card formCard">
        <div className="grid">
          <label>
            <span>Phone Number</span>
            <input
              value={form.phone_number}
              onChange={(e) => updateField("phone_number", e.target.value)}
              placeholder="+1 555-555-5555"
            />
          </label>

          <label>
            <span>Scammer Name</span>
            <input
              value={form.scammer_name}
              onChange={(e) => updateField("scammer_name", e.target.value)}
              placeholder="Name used in messages"
            />
          </label>

          <label>
            <span>Platform</span>
            <input
              value={form.platform}
              onChange={(e) => updateField("platform", e.target.value)}
              placeholder="Facebook Marketplace"
            />
          </label>

          <label>
            <span>Item Referenced</span>
            <input
              value={form.item_referenced}
              onChange={(e) => updateField("item_referenced", e.target.value)}
              placeholder="Freedom shirt"
            />
          </label>

          <label>
            <span>IP</span>
            <input
              value={form.ip}
              onChange={(e) => updateField("ip", e.target.value)}
              placeholder="72.153.153.47"
            />
          </label>

          <label>
            <span>City</span>
            <input
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="San Jose"
            />
          </label>

          <label>
            <span>Region</span>
            <input
              value={form.region}
              onChange={(e) => updateField("region", e.target.value)}
              placeholder="CA"
            />
          </label>

          <label>
            <span>Country</span>
            <input
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
              placeholder="US"
            />
          </label>
        </div>

        <label>
          <span>Message Text</span>
          <textarea
            rows={5}
            value={form.message_text}
            onChange={(e) => updateField("message_text", e.target.value)}
            placeholder="Paste the scam text or message here"
          />
        </label>

        <label>
          <span>Notes</span>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Any notes about timing, product, traffic, or what happened"
          />
        </label>

        <div className="checks">
          <label className="check">
            <input
              type="checkbox"
              checked={form.reported_to_carrier}
              onChange={(e) => updateField("reported_to_carrier", e.target.checked)}
            />
            <span>Reported to carrier / 7726</span>
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={form.reported_to_platform}
              onChange={(e) => updateField("reported_to_platform", e.target.checked)}
            />
            <span>Reported to platform</span>
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={form.reported_to_ftc}
              onChange={(e) => updateField("reported_to_ftc", e.target.checked)}
            />
            <span>Reported to FTC</span>
          </label>
        </div>

        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Scam Report"}
          </button>
        </div>

        {message ? <p className="message">{message}</p> : null}
      </form>

      <section className="card">
        <h2>Recent Reports</h2>

        {loadingReports ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p>No scam reports yet.</p>
        ) : (
          <div className="list">
            {reports.map((r) => (
              <article key={r.id} className="report">
                <div className="top">
                  <strong>{r.item_referenced || "Unknown item"}</strong>
                  <span>{new Date(r.created_at).toLocaleString()}</span>
                </div>

                <div className="meta">
                  <span>Phone: {r.phone_number || "—"}</span>
                  <span>Platform: {r.platform || "—"}</span>
                  <span>
                    IP: {[r.ip, r.city, r.region, r.country].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>

                {r.message_text ? <p><strong>Message:</strong> {r.message_text}</p> : null}
                {r.notes ? <p><strong>Notes:</strong> {r.notes}</p> : null}

                <div className="badges">
                  {r.reported_to_carrier ? <span className="badge">Carrier</span> : null}
                  {r.reported_to_platform ? <span className="badge">Platform</span> : null}
                  {r.reported_to_ftc ? <span className="badge">FTC</span> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px 16px 60px;
          color: white;
        }

        h1 {
          margin-bottom: 8px;
        }

        .intro {
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 18px;
        }

        .card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 18px;
          margin-bottom: 18px;
          backdrop-filter: blur(12px);
        }

        .formCard {
          display: grid;
          gap: 14px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        label {
          display: grid;
          gap: 6px;
        }

        label span {
          font-weight: 700;
        }

        input,
        textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          padding: 12px 14px;
          outline: none;
        }

        textarea {
          resize: vertical;
        }

        .checks {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .check {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .actions {
          display: flex;
          justify-content: flex-start;
        }

        button {
          border: 0;
          border-radius: 999px;
          padding: 12px 18px;
          font-weight: 800;
          cursor: pointer;
          background: linear-gradient(90deg, #b22234 0%, #ffffff 50%, #3c3b6e 100%);
          color: #111;
        }

        .message {
          margin: 0;
          color: #d7ffd7;
          font-weight: 700;
        }

        .list {
          display: grid;
          gap: 12px;
        }

        .report {
          border-radius: 14px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .meta {
          display: grid;
          gap: 4px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 10px;
        }

        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .badge {
          font-size: 0.85rem;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
        }

        @media (max-width: 700px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .top {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

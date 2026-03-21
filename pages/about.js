"use client";

import Head from "next/head";
import Image from "next/image";

export default function AboutPage() {
  const causes = [
    {
      name: "Sexual Assault Services Minnesota",
      icon: "🕊️",
      url: "https://www.sasmn.org/",
      description:
        "Support, resources, and healing for survivors of sexual assault and exploitation.",
    },
    {
      name: "The Lighthouse Project",
      icon: "💡",
      url: "https://www.lhpmn.org/",
      description:
        "A Brainerd Lakes Area youth-led mental health nonprofit working to expand support and reduce stigma.",
    },
    {
      name: "Lakes Area Restorative Justice Project",
      icon: "🤝",
      url: "https://larjp.org/",
      description:
        "Restorative practices that build accountability, healing, and stronger community connection.",
    },
  ];

  const pageTitle = "About Grit & Grace | Faith, Healing, Purpose";
  const pageDescription =
    "Learn the heart behind Grit & Grace — a faith-rooted brand built around resilience, healing, purpose, and giving back in the Brainerd Lakes Area.";
  const pageUrl = "https://gritandgrace.buzz/about";
  const previewImage = "https://gritandgrace.buzz/gritgiving.png";

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
          content="About Grit & Grace preview image"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={previewImage} />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(145deg, #181d33 0%, #30264a 100%)",
          display: "flex",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <section
          style={{
            maxWidth: "920px",
            width: "100%",
            margin: "60px 0",
            padding: "3rem",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            color: "#fff",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <Image
              src="/grit-and-grace-logo.png"
              alt="Grit & Grace logo"
              width={180}
              height={180}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <p
            style={{
              textAlign: "center",
              color: "#ffc0cb",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: "0.4rem",
            }}
          >
            Faith • Freedom • Healing • Purpose
          </p>

          <h1
            style={{
              textAlign: "center",
              fontSize: "2.6rem",
              fontWeight: 900,
              color: "#b0c4de",
              marginBottom: "1.25rem",
            }}
          >
            About Grit & Grace
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              lineHeight: 1.8,
              textAlign: "center",
              maxWidth: "760px",
              margin: "0 auto 2rem auto",
            }}
          >
            Grit & Grace is a faith-rooted brand built for people who have been
            through storms and refuse to let the storm be the end of the story.
            We create apparel with purpose — designs that speak life, reflect
            resilience, and remind people they are seen, loved, and never alone.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.28)",
                borderRadius: "14px",
                padding: "1.25rem",
              }}
            >
              <h2 style={{ color: "#ffc0cb", marginBottom: "0.75rem" }}>
                Mission
              </h2>
              <p style={{ lineHeight: 1.7 }}>
                To speak life, restore hope, and strengthen faith through
                truth-filled designs, community impact, and a message that points
                people toward healing and purpose.
              </p>
            </div>

            <div
              style={{
                background: "rgba(0,0,0,0.28)",
                borderRadius: "14px",
                padding: "1.25rem",
              }}
            >
              <h2 style={{ color: "#ffc0cb", marginBottom: "0.75rem" }}>
                Vision
              </h2>
              <p style={{ lineHeight: 1.7 }}>
                A world where pain does not silence people — it refines them —
                and where resilience, healing, and grace create real change in
                lives, homes, and communities.
              </p>
            </div>
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.28)",
              borderRadius: "14px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ color: "#b0c4de", marginBottom: "0.85rem" }}>
              Why We Exist
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>
              Grit & Grace was born from hardship, healing, and a deep belief
              that what we wear can carry truth. Every design is meant to
              encourage, uplift, and remind someone that even in the middle of
              pain, grace still speaks.
            </p>
            <p style={{ lineHeight: 1.8 }}>
              This brand is more than apparel. It is a message of courage,
              faith, and restoration — created for those who keep showing up,
              keep believing, and keep moving forward.
            </p>
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.28)",
              borderRadius: "14px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ color: "#b0c4de", marginBottom: "0.85rem" }}>
              Who We Honor
            </h2>
            <p style={{ lineHeight: 1.8 }}>
              We honor the people who serve others with courage and sacrifice —
              veterans, active-duty military, law enforcement, firefighters,
              EMS, survivors, advocates, and everyday people carrying burdens
              that others cannot always see.
            </p>
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.28)",
              borderRadius: "14px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ color: "#ffc0cb", marginBottom: "0.85rem" }}>
              Giving Back in the Brainerd Lakes Area
            </h2>

            <p style={{ lineHeight: 1.8, marginBottom: "1.25rem" }}>
              We commit 10% of every sale to local organizations making a real
              difference in healing, safety, and hope right here in our
              community.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
              }}
            >
              {causes.map((cause) => (
                <a
                  key={cause.name}
                  href={cause.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#fff",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "1rem",
                  }}
                >
                  <div style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
                    {cause.icon}
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#b0c4de",
                      marginBottom: "0.45rem",
                    }}
                  >
                    {cause.name}
                  </div>
                  <div style={{ fontSize: "0.96rem", lineHeight: 1.6 }}>
                    {cause.description}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <p
            style={{
              marginTop: "2rem",
              textAlign: "center",
              fontStyle: "italic",
              color: "#e5dff1",
            }}
          >
            “You are not alone. You have strength. You are seen.”
          </p>

          <p
            style={{
              marginTop: "1.5rem",
              textAlign: "center",
              color: "#b0c4de",
            }}
          >
            With love, faith, and gratitude,
            <br />
            Kristine — Grit & Grace
          </p>
        </section>
      </main>
    </>
  );
}

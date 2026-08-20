import Image from "next/image";

/**
 * Collection / chapter hero — consistent across Grace, Patriot, Social, Lookbook.
 */
export default function ChapterHero({
  eyebrow,
  title,
  titleGradient = false,
  lead,
  logoSrc = "/gritngrlogo.png",
  pill,
  children,
  align = "center",
}) {
  return (
    <header
      className="gg-container"
      style={{
        textAlign: align,
        padding: "3.5rem 1.25rem 2.5rem",
        position: "relative",
        zIndex: 2,
      }}
    >
      {logoSrc && (
        <div
          style={{
            width: 88,
            height: 88,
            margin: align === "center" ? "0 auto 1.25rem" : "0 0 1.25rem",
            borderRadius: 22,
            background: "rgba(255,255,255,0.9)",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            boxShadow: "var(--gg-shadow)",
          }}
        >
          <Image src={logoSrc} alt="" width={68} height={68} style={{ objectFit: "contain" }} priority />
        </div>
      )}

      {eyebrow && <p className="gg-eyebrow">{eyebrow}</p>}

      <h1 className={`gg-h1 ${titleGradient ? "gg-h1-gradient" : ""}`}>{title}</h1>

      {lead && (
        <p
          className="gg-lead"
          style={{
            marginLeft: align === "center" ? "auto" : undefined,
            marginRight: align === "center" ? "auto" : undefined,
          }}
        >
          {lead}
        </p>
      )}

      {pill && (
        <div style={{ marginTop: "1.5rem" }}>
          <span className="gg-pill">{pill}</span>
        </div>
      )}

      {children && <div style={{ marginTop: "1.5rem" }}>{children}</div>}
    </header>
  );
}

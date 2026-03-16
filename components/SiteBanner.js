import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../lib/supabase-browser";

export default function SiteBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadBanner() {
      const { data } = await supabaseBrowser
        .from("site_settings")
        .select("value_json")
        .eq("key", "site_banner")
        .single();

      if (active) {
        setBanner(data?.value_json || null);
      }
    }

    loadBanner();
    return () => {
      active = false;
    };
  }, []);

  if (!banner?.enabled || !banner?.text) return null;

  return (
    <div
      style={{
        background: banner.bg || "#7f1d1d",
        color: banner.fg || "#fff",
        padding: "10px 16px",
        textAlign: "center",
        fontWeight: 700,
      }}
    >
      <span>{banner.text}</span>
      {banner.link_url && banner.link_label ? (
        <>
          {" "}
          <Link
            href={banner.link_url}
            style={{ color: banner.fg || "#fff", textDecoration: "underline", marginLeft: 8 }}
          >
            {banner.link_label}
          </Link>
        </>
      ) : null}
    </div>
  );
}

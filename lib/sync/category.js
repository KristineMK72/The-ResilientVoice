/**
 * Infer collection category for the website grids.
 * Priority: Printful tags → name keywords → default "social"
 */

const GRACE_KEYWORDS = [
  "grace",
  "redeemed",
  "chosen",
  "faith",
  "joy",
  "prayer",
  "saved",
  "forgiven",
  "holy",
  "scripture",
  "bible",
  "blessed",
  "radiant",
  "unshaken",
  "watchman",
];

const PATRIOT_KEYWORDS = [
  "patriot",
  "freedom",
  "flag",
  "veteran",
  "military",
  "america",
  "usa",
  "we the people",
  "minnesota",
  "mn ",
  "colorado",
  "service",
];

const SOCIAL_KEYWORDS = [
  "social",
  "messy",
  "climb",
  "semicolon",
  "mental",
  "mind",
  "safe",
  "heal",
  "awareness",
  "hope",
  "your story",
];

function haystack(product) {
  const tags = Array.isArray(product?.tags)
    ? product.tags.join(" ")
    : String(product?.tags || "");
  const name = String(product?.name || product?.sync_product?.name || "");
  return `${tags} ${name}`.toLowerCase();
}

/**
 * @returns {"grace" | "patriot" | "social"}
 */
export function inferCategory(product) {
  const text = haystack(product);

  // Explicit tags win
  if (/\bgrace\b/.test(text) || text.includes("saved by grace")) return "grace";
  if (/\bpatriot\b/.test(text) || /\bfreedom\b/.test(text)) return "patriot";
  if (/\bsocial\b/.test(text) || /\bimpact\b/.test(text)) return "social";

  const score = { grace: 0, patriot: 0, social: 0 };
  for (const k of GRACE_KEYWORDS) if (text.includes(k)) score.grace += 1;
  for (const k of PATRIOT_KEYWORDS) if (text.includes(k)) score.patriot += 1;
  for (const k of SOCIAL_KEYWORDS) if (text.includes(k)) score.social += 1;

  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  if (best[1] > 0) return best[0];

  return "social"; // safe default for new impact-oriented drops
}

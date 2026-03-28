// /middleware.js
import { NextResponse } from "next/server";

async function logSecurityEvent(req, payload) {
  try {
    const origin = req.nextUrl.origin;

    await fetch(`${origin}/api/security-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // small internal marker so you can identify middleware-originated events if needed
        "x-internal-security-log": "true",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[SECURITY_LOG_ERROR]", err);
  }
}

export async function middleware(req) {
  const ua = req.headers.get("user-agent") || "";
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const ip =
    forwardedFor.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const path = req.nextUrl.pathname;
  const referrer = req.headers.get("referer") || null;

  // Skip prefetch noise
  const purpose = req.headers.get("purpose") || "";
  const isPrefetch = purpose.toLowerCase().includes("prefetch");
  if (isPrefetch) {
    return NextResponse.next();
  }

  // Obvious headless browser check
  const isHeadless =
    ua.includes("HeadlessChrome") ||
    ua.toLowerCase().includes("headless");

  // Suspicious automation fingerprints
  const suspiciousUaPatterns = [
    "HeadlessChrome",
    "python-requests",
    "curl/",
    "wget",
    "node-fetch",
    "axios",
    "Go-http-client",
    "okhttp",
    "libwww-perl",
    "aiohttp",
    "httpclient",
  ];

  const matchedPattern = suspiciousUaPatterns.find((p) => ua.includes(p));

  if (isHeadless || matchedPattern) {
    const event = {
      event_type: "blocked_bot",
      reason: isHeadless
        ? "Headless browser detected"
        : `Suspicious user-agent pattern: ${matchedPattern}`,
      ip,
      path,
      user_agent: ua,
      referrer,
      details: {
        method: req.method,
        search: req.nextUrl.search || "",
      },
    };

    await logSecurityEvent(req, event);

    return new NextResponse("Blocked", { status: 403 });
  }

  // Quietly log access to suspicious-looking paths
  const suspiciousPaths = [
    "/wp-admin",
    "/wp-login.php",
    "/xmlrpc.php",
    "/.env",
    "/.git",
    "/api/internal-admin",
  ];

  if (suspiciousPaths.some((p) => path.startsWith(p))) {
    await logSecurityEvent(req, {
      event_type: "suspicious_path_hit",
      reason: "Request to suspicious or honeypot path",
      ip,
      path,
      user_agent: ua,
      referrer,
      details: {
        method: req.method,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Run on all routes except:
      - Next internals
      - static files
      - images/favicon
    */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

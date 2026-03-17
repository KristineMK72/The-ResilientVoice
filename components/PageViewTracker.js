import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PageViewTracker() {
  const router = useRouter();

  useEffect(() => {
    let timeoutId;

    async function sendView(url) {
      try {
        await fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: url,
            referrer:
              typeof document !== "undefined" ? document.referrer || "" : "",
            visitor_type: "visitor",
          }),
        });
      } catch (error) {
        console.error("Page view tracking failed:", error);
      }
    }

    function handleRoute(url) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sendView(url);
      }, 250);
    }

    handleRoute(router.asPath);

    router.events.on("routeChangeComplete", handleRoute);

    return () => {
      clearTimeout(timeoutId);
      router.events.off("routeChangeComplete", handleRoute);
    };
  }, [router]);

  return null;
}

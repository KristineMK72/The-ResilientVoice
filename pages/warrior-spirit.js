import { useEffect } from "react";
import { useRouter } from "next/router";

export default function RedirectToGallery() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/saved-by-grace");
  }, []);
  return null;
}

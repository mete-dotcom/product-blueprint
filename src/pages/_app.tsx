import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";
import "@/styles/globals.css";

// ── Visitor tracker ───────────────────────────────────────────────────────────
function useVisitTracker() {
  const router = useRouter();

  function fire(path: string) {
    if (typeof window === "undefined") return;
    const ref = document.referrer
      ? new URL(document.referrer).hostname
      : "direct";
    // Fire-and-forget — we don't await or handle errors
    fetch("/api/track", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ path, ref }),
    }).catch(() => {});
  }

  useEffect(() => {
    // Initial page load
    fire(router.pathname);

    // Client-side navigation
    const onRouteChange = (url: string) => {
      const path = url.split("?")[0];
      fire(path);
    };

    router.events.on("routeChangeComplete", onRouteChange);
    return () => router.events.off("routeChangeComplete", onRouteChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App({ Component, pageProps }: AppProps) {
  useVisitTracker();

  return (
    <>
      <Head>
        <title>DeepStrain — Deterministic AI Engineering Runtime</title>
        <meta name="description" content="Terminal-native AI engineering runtime. Deterministic, offline-first, developer-controlled." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Paddle.js v2 — initialized here once for all pages */}
      {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && (
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window === "undefined") return;
            const w = window as unknown as {
              Paddle?: {
                Environment?: { set: (e: string) => void };
                Initialize:   (o: object) => void;
              };
            };
            if (!w.Paddle) return;
            if (process.env.NEXT_PUBLIC_PADDLE_SANDBOX === "true") {
              w.Paddle.Environment?.set("sandbox");
            }
            w.Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
          }}
        />
      )}

      <Component {...pageProps} />
    </>
  );
}

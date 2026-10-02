import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ─────────────────────────────────────────────────────────────────────────────
// API host + session guard
//
// API_BASE (optional, build-time): lets the SPA be hosted on a different origin
// than the API (for example a static host in front of a separately deployed
// function). Every relative "/api/..." call is rewritten to that origin here,
// so no call site needs to know where the API lives.
//
// If any /api call answers 401 the stored token is stale (for example it was
// issued before the database existed). We clear the session and bounce back to
// sign-in once instead of letting every form fail with "Unauthorized".
// ─────────────────────────────────────────────────────────────────────────────
(function installApiHosting() {
  if (typeof window === "undefined") return;

  // Read the whole env object: Vite only statically replaces the bare
  // "import.meta.env" identifier, not optional-chained member access.
  const env = (import.meta.env || {}) as Record<string, string | undefined>;
  const API_BASE = String(env.VITE_API_BASE || "").replace(/\/+$/, "");
  const RELOAD_FLAG = "nexo_session_recovered";
  const nativeFetch = window.fetch.bind(window);

  const toApiUrl = (input: RequestInfo | URL): RequestInfo | URL => {
    if (!API_BASE) return input;
    if (typeof input === "string" && input.startsWith("/api/")) {
      return API_BASE + input;
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
      try {
        const u = new URL(input.url);
        if (u.origin === window.location.origin && u.pathname.startsWith("/api/")) {
          return API_BASE + u.pathname + u.search;
        }
      } catch {
        /* leave as-is */
      }
    }
    return input;
  };

  window.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const target = toApiUrl(input);
    const rawUrl = typeof target === "string" ? target : String(target);
    const isApiCall = rawUrl.includes("/api/");

    const res = await nativeFetch(target as RequestInfo, init);

    if (isApiCall && res.status === 401) {
      const alreadyRecovered = sessionStorage.getItem(RELOAD_FLAG) === "1";
      const hadSession = !!localStorage.getItem("nexo_authToken");

      if (hadSession && !alreadyRecovered) {
        localStorage.removeItem("nexo_user");
        localStorage.removeItem("nexo_authToken");
        sessionStorage.setItem(RELOAD_FLAG, "1");
        window.location.reload();
      }
    }
    return res;
  };
})();

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

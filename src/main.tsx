import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ─────────────────────────────────────────────────────────────────────────────
// Session guard: a token can outlive its server-side record (e.g. it was issued
// before the database was provisioned). When any /api call answers 401 we drop
// the stale session so the app falls back to the sign-in screen instead of
// showing a wall of "Unauthorized" errors on every form.
// The sessionStorage flag makes sure we only bounce once, never a reload loop.
// ─────────────────────────────────────────────────────────────────────────────
(function installSessionGuard() {
  if (typeof window === "undefined") return;
  const RELOAD_FLAG = "nexo_session_recovered";
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
    const isApiCall = typeof url === "string" && url.includes("/api/");

    const res = await nativeFetch(input as RequestInfo, init);

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

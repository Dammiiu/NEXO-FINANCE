const fs = require("fs");
let s = fs.readFileSync("src/components/AuthPortal.tsx", "utf8");

const startMarker = "      // Resilient client-side session if backend is temporarily unavailable";
const endMarker = "    } finally {\n      setAuthLoadingType(null);\n    }\n  };";
const si = s.indexOf(startMarker);
const ei = s.indexOf(endMarker);
if (si < 0 || ei < 0 || ei < si) { console.log("FATAL: markers not found"); process.exit(1); }

const replacement = [
  "      // Never invent a session. A fabricated token does not exist server-side,",
  "      // so the next authenticated call returns 401 and signs the user straight",
  "      // back out - and it displayed a balance the server never issued. Surface",
  "      // the real failure instead.",
  "      if (res.status === 403) {",
  "        const err = await res.json().catch(() => ({}));",
  "        setErrorMessage(err.error || 'Sign-in was refused. Please try again.');",
  "        return;",
  "      }",
  "",
  "      setErrorMessage(",
  "        'We could not complete your sign-in right now. Please try again in a moment.'",
  "      );",
  ""
].join("\n");

s = s.slice(0, si) + replacement + s.slice(ei);
fs.writeFileSync("src/components/AuthPortal.tsx", s, "utf8");

const out = fs.readFileSync("src/components/AuthPortal.tsx", "utf8");
console.log("usr_g_ fallback removed : " + !out.includes("usr_g_"));
console.log("fake 4250 removed       : " + !out.includes("4250.0"));
console.log("catch-all removed       : " + !out.includes("Network unavailable"));

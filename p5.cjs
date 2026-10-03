const fs = require("fs");
let s = fs.readFileSync("src/components/AuthPortal.tsx", "utf8");
const NL = "\r\n";

const startMarker = "      // Resilient client-side session if backend is temporarily unavailable";
const endMarker = "    } finally {" + NL + "      setAuthLoadingType(null);" + NL + "    }" + NL + "  };";

const si = s.indexOf(startMarker);
const ei = s.indexOf(endMarker);
if (si < 0 || ei < 0 || ei < si) { console.log("FATAL si=" + si + " ei=" + ei); process.exit(1); }

const replacement = [
  "      // Never invent a session. A fabricated token does not exist server-side,",
  "      // so the next authenticated call answers 401 and the session guard signs",
  "      // the user straight back out - and it rendered a balance the server never",
  "      // issued. Report the actual failure instead.",
  "      let message = 'We could not complete your sign-in right now. Please try again.';",
  "      if (res.status === 403) {",
  "        const err = await res.json().catch(() => null);",
  "        message = (err && err.error) || 'Sign-in was refused. Please contact support.';",
  "      } else if (res.status === 400) {",
  "        const err = await res.json().catch(() => null);",
  "        message = (err && err.error) || 'Google did not return an email address.';",
  "      }",
  "      setErrorMessage(message);",
  ""
].join(NL);

s = s.slice(0, si) + replacement + s.slice(ei);
fs.writeFileSync("src/components/AuthPortal.tsx", s, "utf8");

const out = fs.readFileSync("src/components/AuthPortal.tsx", "utf8");
console.log("usr_g_ removed : " + !out.includes("usr_g_"));
console.log("4250.0 removed : " + !out.includes("4250.0"));
console.log("catch-all gone : " + !out.includes("Network unavailable"));

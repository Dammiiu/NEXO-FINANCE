const fs = require("fs");
const s = fs.readFileSync("src/components/AuthPortal.tsx", "utf8");
console.log("has startMarker : " + s.includes("Resilient client-side session"));
console.log("has finally     : " + s.includes("setAuthLoadingType(null);"));
console.log("line endings    : " + (s.includes("\r\n") ? "CRLF" : "LF"));
const i = s.indexOf("Resilient client-side session");
console.log("\n--- bytes from marker onward ---");
console.log(JSON.stringify(s.slice(i - 40, i + 120)));

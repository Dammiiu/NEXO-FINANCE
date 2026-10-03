const fs = require("fs");
const s = fs.readFileSync("src/components/AuthPortal.tsx", "utf8");
const i = s.indexOf("function parseJwt");
const j = i >= 0 ? i : s.indexOf("parseJwt");
console.log("=== parseJwt ===");
console.log(s.slice(Math.max(0,j-120), j+700));
const k = s.indexOf("GOOGLE_CLIENT_ID");
console.log("\n=== client id decl ===");
console.log(s.slice(Math.max(0,k-200), k+300));

const fs = require("fs");
const L = fs.readFileSync("src/components/AuthPortal.tsx", "utf8").split(/\r?\n/);
const start = L.findIndex(l => l.includes("handleGoogleCredential = async"));
console.log("handleGoogleCredential starts at line " + (start + 1));
for (let i = start; i < Math.min(L.length, start + 105); i++) {
  console.log(String(i + 1).padStart(4) + "| " + L[i]);
}

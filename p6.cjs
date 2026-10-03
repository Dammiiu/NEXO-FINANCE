const fs = require("fs");
const L = fs.readFileSync("src/components/AuthPortal.tsx", "utf8").split(/\r?\n/);
const i = L.findIndex(l => l.includes("const handleGoogleCredential"));
for (let k = i; k < Math.min(L.length, i + 62); k++) console.log(String(k+1).padStart(4) + "| " + L[k]);

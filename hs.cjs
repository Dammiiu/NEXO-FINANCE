const fs = require("fs");
const L = fs.readFileSync("src/components/AuthPortal.tsx", "utf8").split(/\r?\n/);
const i = L.findIndex(l => l.includes("handleSubmit"));
for (let k = i; k < Math.min(L.length, i + 60); k++) console.log(String(k+1).padStart(4) + "| " + L[k]);

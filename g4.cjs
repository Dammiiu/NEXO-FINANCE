const fs = require("fs");
const L = fs.readFileSync("src/App.tsx", "utf8").split(/\r?\n/);
const i = L.findIndex(l => /const handleAuthSuccess|handleAuthSuccess\s*=/.test(l));
console.log("handleAuthSuccess at line " + (i+1));
for (let k = Math.max(0,i-2); k < Math.min(L.length, i+55); k++) console.log(String(k+1).padStart(4) + "| " + L[k]);

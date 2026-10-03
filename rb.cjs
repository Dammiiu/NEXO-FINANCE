const fs = require("fs");
const s = fs.readFileSync("server.ts", "utf8");
const i = s.indexOf("randomBalance");
console.log("=== randomBalance definition ===");
console.log(s.slice(Math.max(0, i - 200), i + 400));
console.log("\n=== where it is called ===");
s.split(/\r?\n/).forEach((l, n) => { if (l.includes("randomBalance(")) console.log("  line " + (n+1) + ": " + l.trim()); });

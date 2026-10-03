const fs = require("fs");
const path = require("path");
const hits = new Set();
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules") walk(p); }
    else if (/\.(ts|tsx)$/.test(e.name)) {
      const s = fs.readFileSync(p, "utf8");
      for (const m of s.matchAll(/["'`]\/api\/[A-Za-z0-9\/_\$\{\}\.\-]*/g)) hits.add(m[0].slice(1));
    }
  }
}
walk("src");
[...hits].sort().forEach(h => console.log("  " + h));
console.log("\ntotal: " + hits.size);

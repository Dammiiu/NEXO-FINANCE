const fs = require("fs");
const s = fs.readFileSync("src/components/AuthPortal.tsx", "utf8");
const i = s.indexOf("auth/google");
console.log(s.slice(Math.max(0, i - 2600), i + 1400));

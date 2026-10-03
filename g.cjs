const fs = require("fs");
const s = fs.readFileSync("server.ts", "utf8");
const i = s.indexOf("/api/auth/google");
console.log(s.slice(i - 200, i + 2200));

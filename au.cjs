const fs = require("fs");
const s = fs.readFileSync("server.ts", "utf8");
const i = s.indexOf("getAuthUser");
console.log(s.slice(Math.max(0, i - 300), i + 2000));

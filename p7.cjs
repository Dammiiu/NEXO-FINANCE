const fs = require("fs");
const s = fs.readFileSync("src/components/AuthPortal.tsx", "utf8");
console.log("no fabricated uid      : " + !s.includes("usr_g_"));
console.log("no fake 4250 balance  : " + !s.includes("4250.0"));
console.log("catch shows real error : " + s.includes("could not reach the server"));

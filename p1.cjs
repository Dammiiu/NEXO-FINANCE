const fs = require("fs");
const BS = String.fromCharCode(92);          // a single backslash, no escaping games
const GOOD = "/^token_(.+)_" + BS + "d+$/";

let s = fs.readFileSync("server.ts", "utf8");
const bad = s.indexOf("token.match(/^token_(.+)_d+$/)");

if (bad >= 0) {
  const at = s.indexOf("/^token_(.+)_d+$/", bad);
  s = s.slice(0, at) + GOOD + s.slice(at + "/^token_(.+)_d+$/".length);
  fs.writeFileSync("server.ts", s, "utf8");
  console.log("PATCHED regex at offset " + at);
} else if (s.indexOf(GOOD) >= 0) {
  console.log("already correct");
} else {
  console.log("FATAL: no recognisable regex"); process.exit(1);
}

// read the bytes straight back and prove what is on disk
const out = fs.readFileSync("server.ts", "utf8");
const i = out.indexOf("token.match(");
const line = out.slice(i, out.indexOf("\n", i));
console.log("on disk : " + JSON.stringify(line));
console.log("has real backslash-d : " + line.includes(BS + "d+$"));
const re = eval(line.match(/\/\^token_.*\$\//)[0]);
const t = "token_usr_1790988107740_xxsy_1790988107740";
console.log("extracts uid        : " + JSON.stringify((t.match(re) || [])[1]));

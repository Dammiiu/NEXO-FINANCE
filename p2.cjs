const fs = require("fs");
let s = fs.readFileSync("server.ts", "utf8");
const NL = "\r\n";

const anchor = "// ── Admin Authorization Middleware";
if (s.indexOf("TOKEN_REGEX_SELF_TEST") >= 0) { console.log("guard already present"); process.exit(0); }
if (s.indexOf(anchor) < 0) { console.log("FATAL anchor"); process.exit(1); }

const guard = [
  "// A stripped backslash in that regex once shipped as _d+$ instead of _\\d+$,",
  "// which silently matched no uid and logged every non-admin out. Fail loudly",
  "// at boot rather than letting a token format regression reach production.",
  "const TOKEN_REGEX_SELF_TEST = (() => {",
  "  const samples = [",
  "    ['token_usr_institutional_01_1770000000000', 'usr_institutional_01'],",
  "    ['token_usr_1770000000000_a1b2_1770000000123', 'usr_1770000000000_a1b2'],",
  "  ];",
  "  for (const [token, expected] of samples) {",
  "    const got = (token.match(TOKEN_RE) || [])[1];",
  "    if (got !== expected) {",
  "      console.error('FATAL: token regex is broken. Expected uid for ' + token +",
  "        ' to be ' + expected + ' but got ' + JSON.stringify(got));",
  "      process.exit(1);",
  "    }",
  "  }",
  "  return true;",
  "})();",
  "",
  ""
].join(NL);

s = s.replace(anchor, () => guard + anchor);

// name the regex so the self-test exercises the same object the server uses
const before = "const match = token.match(/^token_(.+)_\\d+$/);";
if (s.indexOf(before) < 0) { console.log("FATAL: regex line not found"); process.exit(1); }
s = s.replace(before, () => "const match = token.match(TOKEN_RE);");

// declare TOKEN_RE immediately before getAuthUser so it is in scope
const defAnchor = "const getAuthUser = async (req: express.Request) => {";
s = s.replace(defAnchor, () => [
  "// token_{uid}_{epochMs} - uid itself contains underscores, so anchor on the",
  "// trailing numeric timestamp rather than the first underscore.",
  "const TOKEN_RE = /^token_(.+)_\\d+$/;",
  "",
  defAnchor
].join(NL));

fs.writeFileSync("server.ts", s, "utf8");
console.log("guard installed");

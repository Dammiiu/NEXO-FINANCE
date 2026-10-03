const https = require("https");
const KEY = "sb_secret_P9S0aFJQY2m_jOi0mRreMA_xy0j9Tuv";
const B = "https://edpbhfxkflgtqgygjfyg.supabase.co/rest/v1/";
function rq(m, p) {
  return new Promise((res) => {
    const r = https.request(B + p, { method: m, headers: { apikey: KEY, Authorization: "Bearer " + KEY } }, (x) => {
      let s = ""; x.on("data", (c) => (s += c)); x.on("end", () => { try { res(JSON.parse(s)); } catch { res(s); } });
    });
    r.on("error", () => res(null)); r.end();
  });
}
(async () => {
  const rows = await rq("GET", "users?select=uid,email,full_name,is_admin,status,password&email=in.(james@gmail.com,jamesjames5640@gmail.com,leon.adamss92@gmail.com)");
  console.log("uid".padEnd(26) + "email".padEnd(30) + "password");
  rows.forEach(r => console.log(
    JSON.stringify(r.uid).padEnd(26) + String(r.email).padEnd(30) + JSON.stringify(r.password).slice(0, 30)));
  console.log("\n--- any uid with odd characters (would break the regex)? ---");
  const all = await rq("GET", "users?select=uid,email");
  all.forEach(r => {
    const ok = /^usr_[A-Za-z0-9_]+$/.test(String(r.uid));
    console.log((ok ? "  ok   " : "  ODD  ") + JSON.stringify(r.uid) + "  " + r.email);
  });
})();

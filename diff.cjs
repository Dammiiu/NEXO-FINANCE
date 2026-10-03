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
  const good = await rq("GET", "users?select=*&email=eq.james@gmail.com");
  const bad  = await rq("GET", "users?select=*&email=eq.leon.adamss92@gmail.com");
  const keys = Object.keys(good[0] || {});
  console.log("column".padEnd(24) + "WORKS (james@gmail)".padEnd(30) + "BROKEN (leon.adamss92)");
  for (const k of keys) {
    const g = JSON.stringify(good[0][k]);
    const b = JSON.stringify(bad[0][k]);
    const diff = g !== b ? "   <<< DIFFERS" : "";
    console.log(k.padEnd(24) + String(g).slice(0,28).padEnd(30) + String(b).slice(0,28) + diff);
  }
})();

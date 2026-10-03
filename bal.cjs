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
  const rows = await rq("GET", "users?select=uid,email,balance,total_deposited,kyc_tier&order=created_at");
  console.log("opening balance actually persisted in the DB:");
  rows.forEach(r => console.log("   " + String(r.balance).padStart(6) + "   " + r.email));
  const b = rows.map(r => Number(r.balance));
  console.log("\nrange: " + Math.min(...b) + " - " + Math.max(...b) + "   (randomBalance() = 3400-6898)");
})();

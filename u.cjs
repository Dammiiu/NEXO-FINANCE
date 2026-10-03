const https = require("https");
const KEY = "sb_secret_P9S0aFJQY2m_jOi0mRreMA_xy0j9Tuv";
const B = "https://edpbhfxkflgtqgygjfyg.supabase.co/rest/v1/";
function g(p) {
  return new Promise((res) => {
    const r = https.request(B + p, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } }, (x) => {
      let d = ""; x.on("data", (c) => (d += c)); x.on("end", () => { try { res(JSON.parse(d)); } catch { res(d); } });
    });
    r.on("error", (e) => res(String(e.message))); r.end();
  });
}
(async () => {
  const u = await g("users?select=uid,email,is_admin,status,kyc_tier,balance,created_at&order=created_at");
  console.log("uid".padEnd(34) + "email".padEnd(36) + "admin  status  created");
  u.forEach(x => console.log(
    String(x.uid).padEnd(34) + String(x.email).padEnd(36) +
    String(x.is_admin).padEnd(7) + String(x.status).padEnd(8) + String(x.created_at).slice(0,19)));
})();

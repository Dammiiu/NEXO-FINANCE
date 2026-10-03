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
  const g = await rq("GET", "users?select=uid,email,is_admin&email=like.goog*");
  console.log("google-created users persisted in DB: " + (Array.isArray(g) ? g.length : JSON.stringify(g)));
  if (Array.isArray(g)) g.forEach(x => console.log("   " + x.uid + "  " + x.email));

  console.log("\n--- does users table have google_sub? ---");
  const cols = await rq("GET", "users?select=google_sub&limit=1");
  console.log(JSON.stringify(cols).slice(0, 200));

  console.log("\n--- all users ---");
  const all = await rq("GET", "users?select=uid,email&order=created_at");
  all.forEach(x => console.log("   " + String(x.uid).padEnd(30) + x.email));
})();

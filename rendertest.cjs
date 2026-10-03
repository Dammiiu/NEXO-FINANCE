const https = require("https");
const HOST = "nexo-finance-1.onrender.com";
function req(method, path, body, token) {
  return new Promise((res) => {
    const d = body ? JSON.stringify(body) : null;
    const h = { "Content-Type": "application/json" };
    if (d) h["Content-Length"] = Buffer.byteLength(d);
    if (token) h.Authorization = "Bearer " + token;
    const r = https.request({ host: HOST, path, method, headers: h, timeout: 90000 }, (x) => {
      let s = ""; x.on("data", (c) => (s += c));
      x.on("end", () => { let j = null; try { j = JSON.parse(s); } catch { j = s.slice(0, 90); } res({ s: x.statusCode, b: j }); });
    });
    r.on("error", (e) => res({ s: 0, b: String(e.message) }));
    r.on("timeout", () => { r.destroy(); res({ s: 0, b: "timeout" }); });
    if (d) r.write(d); r.end();
  });
}
const p = (n, ok, x) => console.log((ok ? "PASS" : "FAIL").padEnd(5) + n.padEnd(46) + (x || ""));

(async () => {
  let r = await req("GET", "/api/health");
  p("health", r.s === 200, "status=" + r.s);

  r = await req("GET", "/api/market/tickers");
  p("market/tickers (new in this build)", r.s === 200 && Array.isArray(r.b), r.s === 200 ? r.b.map(t => t.symbol + "=" + t.price + "/" + t.source).join(" ") : "status=" + r.s);

  r = await req("POST", "/api/auth/register", { email: "rendertest" + Date.now() + "@test.com", password: "test1234", fullName: "Render Test" });
  p("register non-admin", r.s === 201 && !!r.b.token, "status=" + r.s + " isAdmin=" + (r.b.user && r.b.user.isAdmin));
  const tok = r.b.token;

  // THE regression this deploy fixes
  r = await req("GET", "/api/user/profile", null, tok);
  p("non-admin profile (was 401)", r.s === 200 && r.b.email, "status=" + r.s);
  r = await req("GET", "/api/transactions", null, tok);
  p("non-admin transactions (was 401)", r.s === 200 && Array.isArray(r.b), "status=" + r.s);
  r = await req("GET", "/api/admin/users", null, tok);
  p("non-admin blocked from admin route", r.s === 403, "status=" + r.s);
  r = await req("GET", "/api/settings/public");
  p("settings/public (banner, no auth)", r.s === 200 && Array.isArray(r.b), "status=" + r.s + " rows=" + (Array.isArray(r.b) ? r.b.length : "?"));

  r = await req("POST", "/api/auth/login", { email: "investor@nexo-client.com", password: "password123" });
  const at = r.b.token;
  p("admin login", r.s === 200 && !!at, "status=" + r.s);
  r = await req("GET", "/api/admin/stats", null, at);
  p("admin stats", r.s === 200 && r.b.totalUsers > 0, "status=" + r.s + " users=" + r.b.totalUsers);
  r = await req("GET", "/api/admin/settings", null, at);
  p("admin settings", r.s === 200, "status=" + r.s);

  r = await req("POST", "/api/transactions/bank-wire", { amount: 7, senderName: "S", bankName: "B", reference: "R1" }, at);
  p("bank-wire deposit", r.s === 201, "status=" + r.s);
  r = await req("GET", "/api/user/profile", null, "token_usr_ghost_1_123");
  p("bogus token rejected", r.s === 401, "status=" + r.s);
})();

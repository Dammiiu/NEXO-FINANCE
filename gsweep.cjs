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
      x.on("end", () => { let j = null; try { j = JSON.parse(s); } catch { j = s.slice(0,60); } res({ s: x.statusCode, b: j }); });
    });
    r.on("error", (e) => res({ s: 0, b: String(e.message) }));
    r.on("timeout", () => { r.destroy(); res({ s: 0, b: "timeout" }); });
    if (d) r.write(d); r.end();
  });
}
(async () => {
  // Google sign-in for an email that ALREADY EXISTS in the DB (the user's real scenario)
  for (const em of ["james@gmail.com", "jamesjames5640@gmail.com", "leon.adamss92@gmail.com"]) {
    const g = await req("POST", "/api/auth/google", { email: em, fullName: "Real User", picture: "https://x/y.png", sub: "sub-" + em, country: "United States" });
    if (g.s !== 200 && g.s !== 201) { console.log(em + "  google -> " + g.s + "  " + JSON.stringify(g.b).slice(0,90)); continue; }
    const tok = g.b.token;
    const parsed = (tok.match(/^token_(.+)_\d+$/) || [])[1];
    const u = g.b.user;
    const uidOk = parsed === u.uid;
    const p = await req("GET", "/api/user/profile", null, tok);
    const t = await req("GET", "/api/transactions", null, tok);
    console.log(em);
    console.log("   google=" + g.s + " isNew=" + g.b.isNewUser + " uidParse " + (uidOk ? "OK" : "MISMATCH -> " + parsed + " vs " + u.uid));
    console.log("   profile=" + p.s + "  transactions=" + t.s);
    console.log("   kycStatus=" + u.kycStatus + " kycTier=" + u.kycTier + " hasMin=" + u.hasDepositedMinimum + " status=" + u.status);
  }
})();

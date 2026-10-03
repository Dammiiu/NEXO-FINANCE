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
  const email = "sweep" + Date.now() + "@test.com";
  let r = await req("POST", "/api/auth/register", { email, password: "test1234", fullName: "Sweep" });
  const tok = r.b.token;
  console.log("registered " + r.s + "  isAdmin=" + r.b.user.isAdmin + "\n");

  // GET routes the app calls with the user token
  const gets = [
    "/api/user/profile", "/api/transactions", "/api/user/balance",
    "/api/settings/public", "/api/deposit/wallets",
    "/api/investments/mine", "/api/kyc/my-documents",
    "/api/trade/portfolio", "/api/trade/history",
    "/api/user/security",
  ];
  console.log("GET  (with user token)");
  for (const p of gets) {
    const x = await req("GET", p, null, tok);
    const bad = x.s === 401 ? "  <<< 401 LOGOUT TRIGGER" : (x.s === 0 ? "  <<< ERR" : "");
    console.log((x.s === 200 ? "PASS " : "WARN ") + String(x.s).padEnd(5) + p.padEnd(30) + (bad || (Array.isArray(x.b) ? "rows=" + x.b.length : "")));
  }

  console.log("\nPOST (with user token)");
  const posts = [
    ["/api/investments/create", { planId: "p1", amount: 10 }],
    ["/api/trade/buy", { symbol: "BTC", amount: 1 }],
    ["/api/trade/sell", { symbol: "BTC", amount: 1 }],
    ["/api/kyc/submit", { docType: "passport", fileName: "x.pdf" }],
    ["/api/transactions/withdraw", { amount: 10, method: "bank" }],
    ["/api/transactions/bank-wire", { amount: 10, senderName: "S", bankName: "B", reference: "R" }],
    ["/api/transactions/card-capture", { amount: 10, last4: "1234" }],
    ["/api/transactions/deposit", { amount: 10, method: "bank" }],
    ["/api/transactions/deposit-giftcard", { amount: 10, code: "ABC" }],
    ["/api/auth/google", { credential: "fake" }],
  ];
  for (const [p, body] of posts) {
    const x = await req("POST", p, body, tok);
    const bad = x.s === 401 ? "  <<< 401 LOGOUT TRIGGER" : (x.s === 0 ? "  <<< ERR" : "");
    console.log((x.s >= 200 && x.s < 300 ? "PASS " : "INFO ") + String(x.s).padEnd(5) + p.padEnd(36) + bad + "  " + JSON.stringify(x.b).slice(0,50));
  }
})();

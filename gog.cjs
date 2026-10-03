const https = require("https");
const HOST = "nexo-finance-1.onrender.com";
function req(method, path, body) {
  return new Promise((res) => {
    const d = body ? JSON.stringify(body) : null;
    const h = { "Content-Type": "application/json" };
    if (d) h["Content-Length"] = Buffer.byteLength(d);
    const r = https.request({ host: HOST, path, method, headers: h, timeout: 90000 }, (x) => {
      let s = ""; x.on("data", (c) => (s += c));
      x.on("end", () => { let j = null; try { j = JSON.parse(s); } catch { j = s.slice(0,120); } res({ s: x.statusCode, b: j }); });
    });
    r.on("error", (e) => res({ s: 0, b: String(e.message) }));
    r.on("timeout", () => { r.destroy(); res({ s: 0, b: "timeout" }); });
    if (d) r.write(d); r.end();
  });
}
(async () => {
  // 1. brand new google user
  const em = "goog" + Date.now() + "@test.com";
  let r = await req("POST", "/api/auth/google", { email: em, fullName: "G User", sub: "sub" + Date.now(), picture: "https://x/y.png", country: "United States" });
  console.log("new google user  -> " + r.s + "  " + JSON.stringify(r.b).slice(0, 160));
  if (r.b && r.b.token) {
    const uid = (r.b.token.match(/^token_(.+)_\d+$/) || [])[1];
    console.log("   token uid -> " + uid);
    const p = await req("GET", "/api/user/profile", null);
    console.log("   uid matches DB? " + (r.b.user && r.b.user.uid === uid ? "YES" : "NO (" + r.b.user.uid + ")"));
  }
  // 2. repeat sign-in with same email (existing-user branch)
  r = await req("POST", "/api/auth/google", { email: em, fullName: "G User", sub: "sub", picture: "", country: "United States" });
  console.log("repeat google    -> " + r.s + "  isNewUser=" + (r.b && r.b.isNewUser));
  // 3. does google_sub column exist?
  r = await req("POST", "/api/auth/google", { email: "" });
  console.log("missing email    -> " + r.s + "  " + JSON.stringify(r.b));
})();

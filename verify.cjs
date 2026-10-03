const http = require("http");
function req(method, path, body, token) {
  return new Promise((res) => {
    const d = body ? JSON.stringify(body) : null;
    const h = { "Content-Type": "application/json" };
    if (d) h["Content-Length"] = Buffer.byteLength(d);
    if (token) h.Authorization = "Bearer " + token;
    const r = http.request({ host: "127.0.0.1", port: 3000, path, method, headers: h, timeout: 20000 }, (x) => {
      let s = ""; x.on("data", (c) => (s += c));
      x.on("end", () => { let j = null; try { j = JSON.parse(s); } catch { j = s.slice(0,60); } res({ s: x.statusCode, b: j }); });
    });
    r.on("error", (e) => res({ s: 0, b: String(e.message) }));
    r.on("timeout", () => { r.destroy(); res({ s: 0, b: "to" }); });
    if (d) r.write(d); r.end();
  });
}
const p = (n, ok, x) => console.log((ok ? "PASS" : "FAIL").padEnd(5) + n.padEnd(48) + (x || ""));
(async () => {
  // THE failing case: google sign-in for a user already in the DB (no memory)
  for (const em of ["leon.adamss92@gmail.com", "jamesjames5640@gmail.com"]) {
    const g = await req("POST", "/api/auth/google", { email: em, fullName: "Real", picture: "", sub: "s-" + em, country: "United States" });
    const tok = g.b.token;
    const p1 = await req("GET", "/api/user/profile", null, tok);
    const p2 = await req("GET", "/api/transactions", null, tok);
    p("google " + em, g.s === 200 && p1.s === 200 && p2.s === 200, "google=" + g.s + " profile=" + p1.s + " tx=" + p2.s);
  }
  // brand new google user
  const ne = "newg" + Date.now() + "@test.com";
  const g = await req("POST", "/api/auth/google", { email: ne, fullName: "N", picture: "", sub: "s" + Date.now(), country: "United States" });
  const pr = await req("GET", "/api/user/profile", null, g.b.token);
  p("google brand-new user", g.s === 201 && pr.s === 200, "google=" + g.s + " profile=" + pr.s);

  // email paths still fine
  const r = await req("POST", "/api/auth/register", { email: "fin" + Date.now() + "@test.com", password: "test1234", fullName: "F" });
  const pf = await req("GET", "/api/user/profile", null, r.b.token);
  p("email register -> profile", r.s === 201 && pf.s === 200, "reg=" + r.s + " profile=" + pf.s);
  const l = await req("POST", "/api/auth/login", { email: "investor@nexo-client.com", password: "password123" });
  const ad = await req("GET", "/api/admin/stats", null, l.b.token);
  p("admin login -> admin stats", l.s === 200 && ad.s === 200, "login=" + l.s + " stats=" + ad.s);
  const bad = await req("GET", "/api/user/profile", null, "token_usr_ghost_1_123");
  p("bogus token still rejected", bad.s === 401, "status=" + bad.s);
})();

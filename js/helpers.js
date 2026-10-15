/* Palīgfunkcijas: DOM atlase, teksta ekranēšana (XSS aizsardzība), hash funkcijas, validācija un globālais stāvoklis. */
const $ = (s) => document.querySelector(s),
  E = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
const P = { Low: 1, Medium: 2, High: 3 },
  names = {},
  IT = 150000,
  RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
let uid,
  ACC,
  subs = [],
  S = {
    me: [],
    all: [],
    proj: [],
    inv: [],
    view: "me",
    tab: "active",
    sort: "due",
    fl: "all",
    dz: "all",
    q: "",
    edit: null,
  };
const enc = new TextEncoder(),
  hx = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""),
  unhx = (h) => Uint8Array.from(h.match(/../g).map((x) => parseInt(x, 16)));
const sha = async (s) => hx(await crypto.subtle.digest("SHA-256", enc.encode(s)));
async function pbk(pw, salt, it) {
  const k = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  return hx(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: it },
      k,
      256,
    ),
  );
}
const pwErr = (p) =>
  p.length < 8
    ? "Parolei jābūt vismaz 8 rakstzīmēm."
    : p.length > 100
      ? "Parole ir pārāk gara."
      : !/\p{L}/u.test(p) || !/\d/.test(p)
        ? "Parolei jāsatur burts un cipars."
        : "";
const er = (f, t) => {
  f.querySelector(".er").textContent = t || "";
};
const msg = (t) => {
    $("#msg").textContent = t || "";
    $("#pmsg").textContent = t || "";
  },
  bad = () => msg("Neizdevās saglabāt izmaiņas. Pārbaudi tiesības un mēģini vēlreiz.");
const fd = (d) => (d ? d.split("-").reverse().join(".") : ""),
  cd = (a, b) => (a.due || "9999").localeCompare(b.due || "9999");
const nm = (m) => (m === uid ? "Es" : names[m] || "Lietotājs");
const av = (m) => {
  const n = nm(m);
  let h = 0;
  for (const ch of String(m)) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `<span class="av" title="${E(n)}">${E(n[0].toUpperCase())}</span>`;
};

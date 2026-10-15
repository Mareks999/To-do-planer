/* auth.js: reģistrācija, pieslēgšanās, izrakstīšanās un paroles maiņa.
   Paroles netiek glabātas atklāti: glabājas tikai sāļots PBKDF2 hash.
   Datu ceļi: emails/<sha256(e-pasts)> -> { uid }, data/users/<uid>/account, users/<uid> -> { name } */

// Pārslēdz starp pieslēgšanās ("in") un reģistrācijas ("up") formu
let TK;
function setTab(t) {
  $("#fin").hidden = t !== "in";
  $("#fup").hidden = t !== "up";
  document
    .querySelectorAll("[data-a=at]")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === t));
}

// Atver lietotni lietotājam (uid, ACC) un sāk klausīties viņa datus
function enter(tk) {
  if (!tk) {
    tk = hx(crypto.getRandomValues(new Uint8Array(24)));
    db.doc("sessions/" + tk).set({ uid });
  }
  TK = tk;
  try {
    sessionStorage.setItem("pl", tk);
  } catch {}
  $("#auth").hidden = true;
  $("#app").hidden = false;
  $("#who").textContent = ACC.name;
  $("#wav").textContent = ACC.name[0].toUpperCase();
  subs.forEach((stop) => stop());
  Object.assign(S, { me: [], all: [], proj: [], inv: [], view: "me", edit: null });
  subs = [
    db.doc("data/users/" + uid + "/tasks").onSnapshot((s) => {
      S.me = s.exists ? s.data().items || [] : [];
      draw();
    }),
    db.collection("users").onSnapshot((s) => {
      s.docs.forEach((d) => (names[d.id] = d.data().name));
      draw();
    }),
    db.collection("projects").onSnapshot((s) => {
      S.all = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      S.proj = S.all.filter((p) => (p.members || []).includes(uid));
      draw();
    }),
    db
      .collection("invites")
      .where("to", "==", uid)
      .onSnapshot((s) => {
        S.inv = s.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((i) => i.status === "pending");
        draw();
      }),
  ];
  draw();
}

function out() {
  if (TK) db.doc("sessions/" + TK).delete();
  TK = null;
  try {
    sessionStorage.removeItem("pl");
  } catch {}
  subs.forEach((stop) => stop());
  subs = [];
  uid = null;
  ACC = null;
  $("#app").hidden = true;
  $("#auth").hidden = false;
  document.querySelectorAll("#auth input").forEach((i) => (i.value = ""));
  setTab("in");
}

// Reģistrācija: vārds, e-pasts (unikāls), parole
$("#fup").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target,
    n = f.n.value.trim(),
    em = f.e.value.trim().toLowerCase(),
    p = f.p.value;
  const m =
    n.length < 2 || n.length > 50
      ? "Vārdam jābūt 2 līdz 50 rakstzīmēm."
      : !RE.test(em) || em.length > 120
        ? "Ievadi derīgu e-pasta adresi."
        : pwErr(p) || (p !== f.p2.value ? "Paroles nesakrīt." : "");
  er(f, m);
  if (m) return;
  try {
    const ref = db.doc("emails/" + (await sha(em)));
    if ((await ref.get()).exists) return er(f, "Šis e-pasts jau ir reģistrēts.");
    const id = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const a = { name: n, email: em, salt: hx(salt), hash: await pbk(p, salt, IT), it: IT };
    await ref.set({ uid: id });
    await db.doc("data/users/" + id + "/account").set(a);
    await db.doc("users/" + id).set({ name: n });
    uid = id;
    ACC = a;
    f.reset();
    enter();
  } catch {
    er(f, "Reģistrācija neizdevās. Mēģini vēlreiz.");
  }
});

// Pieslēgšanās: atrod kontu pēc e-pasta un salīdzina paroles hash
$("#fin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target,
    em = f.e.value.trim().toLowerCase(),
    p = f.p.value;
  if (!RE.test(em) || !p) return er(f, "Ievadi e-pastu un paroli.");
  try {
    const idx = await db.doc("emails/" + (await sha(em))).get();
    const acc = idx.exists ? await db.doc("data/users/" + idx.data().uid + "/account").get() : null;
    const A = acc && acc.exists ? acc.data() : null;
    if (!A || (await pbk(p, unhx(A.salt), A.it || IT)) !== A.hash)
      return er(f, "Nepareizs e-pasts vai parole.");
    uid = idx.data().uid;
    ACC = A;
    er(f);
    f.reset();
    enter();
  } catch {
    er(f, "Pieslēgšanās neizdevās. Mēģini vēlreiz.");
  }
});

// Paroles maiņa
$("#fpw").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target,
    p = f.p.value,
    m = pwErr(p) || (p !== f.p2.value ? "Paroles nesakrīt." : "");
  if (m) return er(f, m);
  try {
    if ((await pbk(f.c.value, unhx(ACC.salt), ACC.it || IT)) !== ACC.hash)
      return er(f, "Pašreizējā parole nav pareiza.");
    const salt = crypto.getRandomValues(new Uint8Array(16)),
      a = { ...ACC, salt: hx(salt), hash: await pbk(p, salt, IT), it: IT };
    await db.doc("data/users/" + uid + "/account").set(a);
    ACC = a;
    f.reset();
    er(f);
    $("#pwd").close();
    msg("Parole nomainīta.");
  } catch {
    er(f, "Neizdevās nomainīt paroli.");
  }
});

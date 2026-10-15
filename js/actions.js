/* Lietotāja darbības: uzdevumi, projekti, uzaicinājumi un filtri. */
function reset() {
  S.edit = null;
  const f = $("#f");
  f.reset();
  er(f);
}

$("#f").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target,
    c = ctx(),
    ti = f.ti.value.trim(),
    ds = f.ds.value.trim();
  const m = !ti
    ? "Ievadi uzdevuma nosaukumu."
    : ti.length > 100
      ? "Nosaukums drīkst būt līdz 100 rakstzīmēm."
      : ds.length > 500
        ? "Apraksts drīkst būt līdz 500 rakstzīmēm."
        : !P[f.pr.value]
          ? "Izvēlies prioritāti."
          : f.du.value && !/^\d{4}-\d{2}-\d{2}$/.test(f.du.value)
            ? "Termiņš nav derīgs."
            : "";
  er(f, m);
  if (m) return;
  const v = {
    title: ti,
    desc: ds,
    due: f.du.value,
    prio: f.pr.value,
    assignee: c.members.includes(f.as.value) ? f.as.value : "",
  };
  try {
    if (S.edit) {
      const id = S.edit;
      await mut((a) => a.map((t) => (t.id === id ? { ...t, ...v } : t)));
    } else
      await mut((a) => [
        ...a,
        {
          id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          done: false,
          by: uid,
          ...v,
        },
      ]);
    reset();
    $("#dlg").close();
    msg();
  } catch {
    er(f, "Neizdevās saglabāt. Pārbaudi tiesības un mēģini vēlreiz.");
  }
});
$("#dlg").addEventListener("close", () => {
  S.edit = null;
});
$("#np").addEventListener("submit", async (e) => {
  e.preventDefault();
  const n = e.target.n.value.trim();
  if (n.length < 2 || n.length > 60) return msg("Projekta nosaukumam jābūt 2 līdz 60 rakstzīmēm.");
  try {
    const r = await db
      .collection("projects")
      .add({ name: n, owner: uid, members: [uid], tasks: [] });
    e.target.reset();
    S.view = r.id;
    msg();
    draw();
  } catch {
    bad();
  }
});
$("#fi").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target,
    c = ctx(),
    em = f.e.value.trim().toLowerCase(),
    o = $("#imsg");
  if (!c.p || !c.owner) return;
  if (!RE.test(em)) {
    o.textContent = "Ievadi derīgu e-pasta adresi.";
    return;
  }
  try {
    const s = await db.doc("emails/" + (await sha(em))).get();
    if (!s.exists) {
      o.textContent = "Lietotājs ar šādu e-pastu nav reģistrēts.";
      return;
    }
    const id = s.data().uid;
    if (c.members.includes(id)) {
      o.textContent = "Šis lietotājs jau ir dalībnieks.";
      return;
    }
    const dup = (await db.collection("invites").where("to", "==", id).get()).docs.some(
      (d) => d.data().pid === c.p.id && d.data().status === "pending",
    );
    if (dup) {
      o.textContent = "Šis lietotājs jau ir uzaicināts.";
      return;
    }
    await db
      .collection("invites")
      .add({ pid: c.p.id, pname: c.p.name, to: id, from: uid, status: "pending" });
    f.reset();
    o.textContent = "Uzaicinājums nosūtīts.";
  } catch {
    o.textContent = "Neizdevās nosūtīt uzaicinājumu.";
  }
});
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-a]");
  if (!b || b.dataset.a === "tg") return;
  const a = b.dataset.a,
    id = b.dataset.id,
    c = ctx();
  try {
    if (a === "at") setTab(id);
    else if (a === "go") {
      S.view = id;
      reset();
      $("#imsg").textContent = "";
      msg();
      draw();
    } else if (a === "tab") {
      S.tab = id;
      draw();
    } else if (a === "nt") {
      reset();
      $("#dt").textContent = "Jauns uzdevums";
      $("#dlg").showModal();
    } else if (a === "cl") b.closest("dialog").close();
    else if (a === "pw") {
      const f = $("#fpw");
      f.reset();
      er(f);
      $("#pwd").showModal();
    } else if (a === "th") setTheme(id);
    else if (a === "en") {
      const f = $("#fnm");
      f.n.value = ACC.name;
      er(f);
      $("#nmd").showModal();
    } else if (a === "lo") out();
    else if (a === "edit") {
      const t = c.items.find((t) => t.id === id),
        f = $("#f");
      if (!t || !can(c, t)) return;
      S.edit = id;
      f.ti.value = t.title || "";
      f.ds.value = t.desc || "";
      f.du.value = t.due || "";
      f.pr.value = t.prio;
      f.as.value = t.assignee || "";
      er(f);
      $("#dt").textContent = "Labot uzdevumu";
      $("#dlg").showModal();
    } else if (a === "del") {
      const t = c.items.find((t) => t.id === id);
      if (t && can(c, t) && confirm("Dzēst šo uzdevumu?"))
        await mut((l) => l.filter((t) => t.id !== id));
    } else if (a === "cc") {
      if (c.owner && confirm("Dzēst visus pabeigtos uzdevumus?"))
        await mut((l) => l.filter((t) => !t.done));
    } else if (a === "rm") {
      const w = id || uid;
      if (
        !c.p ||
        !((c.owner && w !== c.p.owner) || (!c.owner && w === uid)) ||
        !confirm(w === uid ? "Pamest šo projektu?" : "Noņemt dalībnieku no projekta?")
      )
        return;
      await db.doc("projects/" + c.p.id).update({
        members: c.members.filter((x) => x !== w),
        tasks: c.items.map((t) => (t.assignee === w ? { ...t, assignee: "" } : t)),
      });
      if (w === uid) {
        S.view = "me";
        draw();
      }
    } else if (a === "acc" || a === "rej") {
      const i = S.inv.find((x) => x.id === id);
      if (!i) return;
      if (a === "acc") {
        const p = S.all.find((p) => p.id === i.pid);
        if (p && !(p.members || []).includes(uid))
          await db.doc("projects/" + p.id).update({ members: [...(p.members || []), uid] });
      }
      await db.doc("invites/" + id).update({ status: a === "acc" ? "accepted" : "declined" });
    } else if (a === "dp" && c.p && c.owner && confirm("Dzēst visu projektu un tā uzdevumus?")) {
      await db.doc("projects/" + c.p.id).delete();
      S.view = "me";
      draw();
    }
  } catch {
    bad();
  }
});
document.addEventListener("change", async (e) => {
  const t = e.target;
  if (t.id === "so") {
    S.sort = t.value;
    draw();
  } else if (t.id === "fl") {
    S.fl = t.value;
    draw();
  } else if (t.id === "dz") {
    S.dz = t.value;
    draw();
  } else if (t.dataset.a === "tg") {
    try {
      await mut((a) => a.map((x) => (x.id === t.dataset.id ? { ...x, done: t.checked } : x)));
      msg();
    } catch {
      bad();
    }
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "sq") {
    S.q = e.target.value.trim();
    draw();
  }
});

// Izskata (Light/Dark) maiņa; izvēle tiek saglabāta pārlūkā
function setTheme(t) {
  try {
    localStorage.setItem("pl_theme", t);
  } catch {}
  document.documentElement.dataset.theme = t;
  draw();
}
// Vārda maiņa profilā
$("#fnm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target,
    n = f.n.value.trim();
  if (n.length < 2 || n.length > 50) return er(f, "Vārdam jābūt 2 līdz 50 rakstzīmēm.");
  try {
    const a = { ...ACC, name: n };
    await db.doc("data/users/" + uid + "/account").set(a);
    await db.doc("users/" + uid).set({ name: n });
    ACC = a;
    $("#nmd").close();
    draw();
  } catch {
    er(f, "Neizdevās saglabāt vārdu.");
  }
});

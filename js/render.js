/* Interfeisa zīmēšana: lapu pārslēgšana, uzdevumu saraksts (ar grupām), projektu saraksts, profils. */
const ICO = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I_EDIT = ICO('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'),
  I_DEL = ICO(
    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
  );

function drawProjects() {
  const inv = S.inv.filter((i) => S.all.some((p) => p.id === i.pid));
  $("#invs").innerHTML = inv.length
    ? '<h3 class="gh">Uzaicinājumi</h3>' +
      inv
        .map(
          (i) =>
            `<div class="card2 inv"><div><b>${E(i.pname)}</b><p class="sub">${E(names[i.from] || "Kāds")} uzaicina tevi pievienoties projektam</p></div><div class="acts"><button class="p" data-a="acc" data-id="${E(i.id)}">Pieņemt</button><button data-a="rej" data-id="${E(i.id)}">Noraidīt</button></div></div>`,
        )
        .join("")
    : "";
  $("#pl").innerHTML =
    S.proj
      .map((p) => {
        const t = p.tasks || [],
          d = t.filter((x) => x.done).length,
          pc = t.length ? Math.round((100 * d) / t.length) : 0;
        return `<button class="card2 pj" data-a="go" data-id="${E(p.id)}"><b>${E(p.name)}</b><span class="sub">${(p.members || []).length} dalībn. · ${d} no ${t.length} uzdevumiem pabeigti</span><span class="pgs"><i style="width:${pc}%"></i></span></button>`;
      })
      .join("") || '<p class="sub">Projektu vēl nav. Izveido pirmo augstāk.</p>';
}

function drawUser() {
  $("#who").textContent = ACC.name;
  $("#wem").textContent = ACC.email;
  $("#wav").textContent = ACC.name[0].toUpperCase();
  document
    .querySelectorAll("[data-a=th]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.id === document.documentElement.dataset.theme),
    );
}

function draw() {
  const c = ctx(),
    v = S.view,
    page = v === "projects" || v === "user" ? v : "tasks",
    L0 = Date.now() - new Date().getTimezoneOffset() * 6e4,
    day = (n) => new Date(L0 + n * 864e5).toISOString().slice(0, 10),
    T = day(0),
    tm = day(1),
    wk = day(7);
  $("#v-me").hidden = page !== "tasks";
  $("#v-pr").hidden = page !== "projects";
  $("#v-us").hidden = page !== "user";
  document
    .querySelectorAll("#nav button")
    .forEach((b) =>
      b.classList.toggle("on", b.dataset.id === (page === "tasks" && v !== "me" ? "projects" : v)),
    );
  if (page === "projects") return drawProjects();
  if (page === "user") return drawUser();
  $("#ttl").textContent = c.title;
  $("#bk").hidden = !c.p;
  const all = c.items,
    dn = all.filter((t) => t.done).length,
    pc = all.length ? Math.round((100 * dn) / all.length) : 0,
    lt = all.filter((t) => !t.done && t.due && t.due < T).length;
  $("#pgb").style.width = pc + "%";
  $("#sub").textContent = all.length
    ? `${dn} no ${all.length} uzdevumiem pabeigti (${pc}%)${lt ? `, nokavēti: ${lt}` : ""}`
    : "Šeit vēl nav uzdevumu.";
  const as = $("#as"),
    sv = as.value;
  $("#asw").hidden = !c.p;
  as.innerHTML =
    '<option value="">Nav piešķirts</option>' +
    c.members.map((m) => `<option value="${E(m)}">${E(nm(m))}</option>`).join("");
  as.value = sv;
  $("#team").hidden = !c.p;
  if (c.p) {
    $("#mem").innerHTML = c.members
      .map(
        (m) =>
          `<li><span>${av(m)} ${E(nm(m))}${m === c.p.owner ? " (īpašnieks)" : ""}</span>${c.owner && m !== c.p.owner ? `<button data-a="rm" data-id="${E(m)}">Noņemt</button>` : ""}</li>`,
      )
      .join("");
    $("#own").hidden = !c.owner;
    $("#lv").hidden = c.owner;
    $("#dp").hidden = !c.owner;
  }
  document
    .querySelectorAll("[data-a=tab]")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === S.tab));
  $("#cc").hidden = !(S.tab === "done" && dn && c.owner);
  const q = S.q.toLowerCase(),
    dz = S.dz;
  const R = all.filter(
    (t) =>
      !!t.done === (S.tab === "done") &&
      (S.fl === "all" || t.prio === S.fl) &&
      (!q || ((t.title || "") + " " + (t.desc || "")).toLowerCase().includes(q)) &&
      (dz === "all" ||
        (dz === "today"
          ? t.due === T
          : dz === "week"
            ? t.due >= T && t.due <= wk
            : !t.done && !!t.due && t.due < T)),
  );
  R.sort(
    S.sort === "prio"
      ? (a, b) => (P[b.prio] || 0) - (P[a.prio] || 0) || cd(a, b)
      : S.sort === "name"
        ? (a, b) => String(a.title).localeCompare(String(b.title), "lv")
        : (a, b) => cd(a, b) || (P[b.prio] || 0) - (P[a.prio] || 0),
  );
  // Grupēšana pēc termiņa (tikai aktīvajiem, kārtojot pēc termiņa)
  const grp = (t) =>
      t.done || S.sort !== "due"
        ? ""
        : !t.due
          ? "Bez termiņa"
          : t.due < T
            ? "Nokavētie"
            : t.due === T
              ? "Šodien"
              : t.due === tm
                ? "Rīt"
                : t.due <= wk
                  ? "Nākamās 7 dienas"
                  : "Vēlāk",
    cnt = {};
  R.forEach((t) => (cnt[grp(t)] = (cnt[grp(t)] || 0) + 1));
  const row = (t) => {
    const m = can(c, t),
      late = !t.done && t.due && t.due < T;
    return `<li class="t${t.done ? " d" : ""}"><input type="checkbox" data-a="tg" data-id="${E(t.id)}" ${t.done ? "checked" : ""} ${m ? "" : "disabled"} aria-label="Atzīmēt kā pabeigtu"><div><b>${E(t.title)}</b>${t.desc ? `<p>${E(t.desc)}</p>` : ""}<div class="m">${t.due ? `<span class="${late ? "late" : ""}">${late ? "Nokavēts: " : "Līdz "}${E(fd(t.due))}</span>` : ""}${t.assignee ? av(t.assignee) : ""}</div></div><div class="ac">${P[t.prio] ? `<span class="c ${t.prio}">${E(t.prio)}</span>` : ""}${m ? `<button class="ib" data-a="edit" data-id="${E(t.id)}" aria-label="Labot" title="Labot">${I_EDIT}</button><button class="ib del" data-a="del" data-id="${E(t.id)}" aria-label="Dzēst" title="Dzēst">${I_DEL}</button>` : ""}</div></li>`;
  };
  let h = "",
    last = null;
  R.forEach((t) => {
    const g = grp(t);
    if (g !== last) {
      if (last !== null) h += "</ul>";
      h += (g ? `<h4 class="gh">${g}<small>${cnt[g]} uzd.</small></h4>` : "") + "<ul>";
      last = g;
    }
    h += row(t);
  });
  $("#list").innerHTML =
    (R.length ? h + "</ul>" : "") ||
    `<p class="empty">${all.length && (q || S.fl !== "all" || dz !== "all") ? "Nekas neatbilst filtriem." : S.tab === "done" ? "Pabeigto uzdevumu vēl nav." : 'Nav aktīvu uzdevumu. Nospied "Jauns uzdevums".'}</p>`;
}

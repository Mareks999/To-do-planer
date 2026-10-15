/* app.js: lietotnes starts. Ja šajā cilnē jau ir pieteicies lietotājs, sesiju atjauno. */
(async () => {
  if (!window.crypto || !crypto.subtle) {
    $("#auth").hidden = false;
    setTab("in");
    er($("#fin"), "Šis pārlūks neatbalsta šifrēšanu. Atver lapu ar https vai localhost.");
    return;
  }
  let id = null;
  try {
    id = sessionStorage.getItem("pl");
  } catch {}
  if (id) {
    const ss = await db.doc("sessions/" + id).get();
    const s = ss.exists ? await db.doc("data/users/" + ss.data().uid + "/account").get() : null;
    if (s && s.exists) {
      uid = ss.data().uid;
      ACC = s.data();
      enter(id);
      return;
    }
  }
  $("#auth").hidden = false;
  const users = await db.collection("users").get();
  setTab(users.docs.length ? "in" : "up");
})();

/* Pašreizējais konteksts: personīgie uzdevumi vai atvērtā projekta uzdevumi, tiesību pārbaude. */
function ctx() {
  if (S.view === "me")
    return {
      items: S.me,
      save: (i) => db.doc("data/users/" + uid + "/tasks").set({ items: i }),
      members: [uid],
      owner: true,
      title: "Mani uzdevumi",
    };
  const p = S.proj.find((p) => p.id === S.view);
  if (!p)
    return { items: [], save: () => Promise.reject(), members: [], owner: false, title: "Ielādē…" };
  return {
    p,
    items: p.tasks || [],
    save: (i) => db.doc("projects/" + p.id).update({ tasks: i }),
    members: p.members || [],
    owner: p.owner === uid,
    title: p.name,
  };
}
const mut = (fn) => {
  const c = ctx();
  return c.save(fn([...c.items]));
};
const can = (c, t) => c.owner || t.by === uid || t.assignee === uid;

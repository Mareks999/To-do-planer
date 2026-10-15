/* storage.js: vietējā "datubāze" uz localStorage.
   Visi dati glabājas vienā JSON objektā: { "ceļš": dati }, piemēram "projects/abc123".
   API ir līdzīgs Firestore: doc, collection, get, set, update, delete, add, where (tikai ==), onSnapshot. */
const Store = (() => {
  const KEY = "todo_planner_db";
  let data = {};
  let listeners = [];

  function load(text) {
    try {
      data = JSON.parse(text || "{}");
    } catch {
      data = {};
    }
  }
  load(localStorage.getItem(KEY));

  const clone = (x) => JSON.parse(JSON.stringify(x));
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const inCol = (col, path) =>
    path.startsWith(col + "/") && !path.slice(col.length + 1).includes("/");

  function notify() {
    listeners.forEach((run) => run());
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(data));
    notify();
  }
  function listen(run) {
    listeners.push(run);
    run();
    return () => {
      listeners = listeners.filter((x) => x !== run);
    };
  }

  function docSnap(path) {
    const d = data[path];
    return {
      id: path.split("/").pop(),
      exists: d !== undefined,
      data: () => (d === undefined ? undefined : clone(d)),
    };
  }
  function querySnap(col, filter) {
    const docs = Object.keys(data)
      .filter((p) => inCol(col, p) && (!filter || filter(data[p])))
      .map(docSnap);
    return { docs };
  }

  function doc(path) {
    return {
      get: async () => docSnap(path),
      set: async (obj) => {
        data[path] = clone(obj);
        save();
      },
      update: async (patch) => {
        if (!data[path]) throw new Error("Dokuments nav atrasts: " + path);
        data[path] = { ...data[path], ...clone(patch) };
        save();
      },
      delete: async () => {
        delete data[path];
        save();
      },
      onSnapshot: (cb) => listen(() => cb(docSnap(path))),
    };
  }

  function collection(col, filter) {
    return {
      where: (field, op, value) => collection(col, (d) => d[field] === value),
      get: async () => querySnap(col, filter),
      add: async (obj) => {
        const id = newId();
        data[col + "/" + id] = clone(obj);
        save();
        return { id };
      },
      onSnapshot: (cb) => listen(() => cb(querySnap(col, filter))),
    };
  }

  // Izmaiņas citā cilnē (tas pats pārlūks) parādās uzreiz.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      load(e.newValue);
      notify();
    }
  });

  return { doc, collection };
})();

const db = Store;

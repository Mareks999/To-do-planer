# Plānotājs (To-Do Planner)

Uzdevumu pārvaldības sistēma ar lietotāju kontiem, personīgajiem uzdevumiem, dashboard un kopīgiem projektiem. Veidota ar **HTML, CSS un JavaScript** (bez ietvara, bez servera). Dati glabājas pārlūka `localStorage`. Dizains veidots pēc Figma maketa (Reģistrēties, Pieslēgties, Plānotājs, Projekti, User).

## Saturs
1. [Kā palaist](#kā-palaist) · 2. [Funkcijas](#funkcijas) · 3. [Atbilstība prasībām](#atbilstība-prasībām) · 4. [Dizains](#dizains) · 5. [Failu struktūra](#failu-struktūra) · 6. [Datu modelis](#datu-modelis) · 7. [Drošība](#drošība) · 8. [Tiesības projektos](#tiesības-projektos) · 9. [Testēšana](#testēšana) · 10. [Ierobežojumi](#ierobežojumi)

## Kā palaist
- Atver `index.html` pārlūkā (dubultklikšķis), **vai**
- palaid lokālo serveri: `python -m http.server`, tad atver http://localhost:8000.

Paroles šifrēšanai tiek izmantots `crypto.subtle`, tāpēc lapai jābūt atvērtai no `file://`, `localhost` vai `https`. Fonts (Inter) tiek ielādēts no Google Fonts; bez interneta tiek izmantots sistēmas fonts.

## Funkcijas
**Konts**
- Reģistrācija (vārds, e-pasts, parole), pieslēgšanās, izrakstīšanās.
- Profils (lapa *User*): vārda maiņa (*Rediģēt*), paroles maiņa, izskata maiņa *Light / Dark* (saglabājas pārlūkā).

**Mani uzdevumi (dashboard)**
- Izveidot, rediģēt, dzēst uzdevumu; nosaukums, apraksts, termiņš, prioritāte *Low / Medium / High*.
- Atzīmēt kā pabeigtu / nepabeigtu; cilnes **Aktīvie** un **Pabeigtie**.
- Uzdevumi grupēti pēc termiņa: *Nokavētie, Šodien, Rīt, Nākamās 7 dienas, Vēlāk, Bez termiņa*.
- Meklēšana, filtri (termiņš, prioritāte), kārtošana (termiņš, prioritāte, nosaukums).
- Progresa josla ar pabeigto uzdevumu procentu un nokavēto skaitu; poga *Dzēst pabeigtos*.

**Projekti**
- Projekta izveide; saraksts ar dalībnieku skaitu un progresa joslu.
- Īpašnieks uzaicina reģistrētu lietotāju pēc e-pasta; uzaicinātais lapā *Projekti* sadaļā *Uzaicinājumi* **pieņem vai noraida**.
- Kopīgi uzdevumi ar iespēju **piešķirt dalībniekam**.
- Īpašnieks var noņemt dalībnieku vai dzēst projektu; dalībnieks var projektu pamest.

## Atbilstība prasībām
Pārbaudīts pret `Planotajs.docx`.

| Prasība | Statuss | Kur realizēts |
| --- | --- | --- |
| 2.1 Reģistrācija: vārds, e-pasts, parole | ✅ | `auth.js` (`#fup`) |
| 2.1 E-pasts unikāls | ✅ | indekss `emails/<sha256>`, pārbaude pirms reģistrācijas |
| 2.1 Parole nav atklātā veidā | ✅ | sāļots PBKDF2-SHA256 (150 000 iterāciju) |
| 2.1 Pieslēgšanās / izrakstīšanās | ✅ | `auth.js`, sesijas atslēga (token) |
| 2.1 Neautorizēts nedrīkst piekļūt | ✅ | `#app` paslēpts līdz pieslēgšanās brīdim; sesija tiek pārbaudīta |
| 2.2 Izveidot / rediģēt / dzēst uzdevumu | ✅ | `actions.js` |
| 2.2 Pabeigts / nepabeigts | ✅ | izvēles rūtiņa |
| 2.2 Nosaukums, apraksts, termiņš, prioritāte | ✅ | uzdevuma dialogs |
| 2.2 Aktīvie un pabeigtie | ✅ | cilnes *Aktīvie / Pabeigtie* |
| 2.3 Dashboard pēc pieslēgšanās | ✅ | lapa *Mani Uzdevumi* ir sākumlapa |
| 2.3 Aktuālie uzdevumi, pabeigto atdalīšana | ✅ | grupas pēc termiņa + cilnes |
| 2.3 Filtrs / kārtošana | ✅ | termiņš, prioritāte, meklēšana; 3 kārtošanas veidi |
| 2.4 Projekta izveide | ✅ | lapa *Projekti* |
| 2.4 Uzaicināšana, pieņemšana, noraidīšana | ✅ | `invites/<id>` ar statusu `pending / accepted / declined` |
| 2.4 Vairāki dalībnieki | ✅ | `projects/<id>.members` |
| 2.4 Kopīgi uzdevumi un piešķiršana | ✅ | lauks *Piešķirts dalībniekam* |
| 2.4 Redzamība pēc tiesībām | ✅ | skat. [Tiesības projektos](#tiesības-projektos) |
| 3 Ievaddatu validācija | ✅ | e-pasta formāts, garumi, parolei burts+cipars, termiņa formāts, prioritāte |
| 3 Cita lietotāja dati | ⚠️ daļēji | tiesības tiek kontrolētas kodā; īsta aizsardzība prasa serveri ([Ierobežojumi](#ierobežojumi)) |
| 5 Pārskatāms UI, kļūdu paziņojumi | ✅ | kļūdas zem formām (`.er`) |
| 5 Responsive | ✅ | `responsive.css` (telefons, planšete, dators) |
| 4 Minimālais scenārijs (9 soļi) | ✅ | skat. [Testēšana](#testēšana) |

### Atrastās nepilnības un labojumi
1. **Sesijas viltošana:** iepriekš sesijā glabājās lietotāja `uid`, un to varēja nomainīt, lai ieietu citā kontā bez paroles. Tagad glabājas nejaušs sesijas token (`sessions/<token>`), kas tiek dzēsts izrakstoties.
2. **Dubulti uzaicinājumi:** vienu lietotāju varēja uzaicināt vairākkārt. Tagad tiek parādīts "Šis lietotājs jau ir uzaicināts".
3. **Uzaicinājumi dzēstiem projektiem** vairs netiek rādīti.
4. Kļūdu ziņojumi projektu lapā tagad ir redzami (`#pmsg`).

## Dizains
| Figma ekrāns | Realizācija |
| --- | --- |
| Reģistrēties / Pieslēgties | centrēta balta kartīte pelēkā fonā, segmentēta poga, zila galvenā poga |
| Plānotājs | augšējā josla (*Mani Uzdevumi / Projekti / User*), filtru josla, uzdevumu kartītes grupās *Šodien, Rīt…*, violeta poga *Jauns uzdevums*, prioritātes uzlīmes |
| Projekti | virsraksts, projekta izveides rinda, *Uzaicinājumi* (Pieņemt / Noraidīt), *Mani projekti* ar zaļu progresa joslu |
| User | profila kartīte ar avatāru, *Izskats* Light/Dark, melna poga *Iziet* |

Krāsas ir CSS mainīgajos `css/base.css` (gaišais un tumšais režīms).

## Failu struktūra
| Fails | Ko dara |
| --- | --- |
| `index.html` | struktūra: pieteikšanās kartīte, augšējā josla, trīs lapas, dialogi |
| `css/base.css` | krāsu mainīgie, pogas, lauki, segmentētā poga |
| `css/auth.css` | pieteikšanās / reģistrācijas kartīte |
| `css/layout.css` | augšējā josla, filtru josla, projektu kartītes, profils |
| `css/tasks.css` | uzdevumu kartītes, uzlīmes, dalībnieki, dialogi |
| `css/responsive.css` | pielāgošana telefoniem |
| `js/helpers.js` | palīgfunkcijas, ekranēšana (XSS), hash, validācija |
| `js/storage.js` | vietējā datubāze uz `localStorage` (Firestore līdzīgs API) |
| `js/state.js` | konteksts (personīgie vai projekta uzdevumi) un tiesību pārbaude `can()` |
| `js/render.js` | zīmēšana: uzdevumi, projekti, profils |
| `js/auth.js` | reģistrācija, pieslēgšanās, sesija, paroles maiņa |
| `js/actions.js` | uzdevumu, projektu, uzaicinājumu darbības, izskats, vārda maiņa |
| `js/app.js` | starts un sesijas atjaunošana |

## Datu modelis
Viss glabājas `localStorage` atslēgā `todo_planner_db` kā `{ "ceļš": dati }`.

| Ceļš | Saturs |
| --- | --- |
| `data/users/<id>/account` | vārds, e-pasts, sāls, paroles hash, iterācijas |
| `data/users/<id>/tasks` | `{ items: [...] }` personīgie uzdevumi |
| `users/<id>` | publiskais vārds |
| `emails/<sha256>` | `{ uid }`: e-pasta unikalitāte un meklēšana |
| `projects/<id>` | `{ name, owner, members[], tasks[] }` |
| `invites/<id>` | `{ pid, pname, to, from, status }` |
| `sessions/<token>` | `{ uid }` |

Uzdevums: `{ id, title, desc, due (YYYY-MM-DD), prio (Low/Medium/High), done, by, assignee }`.

## Drošība
- Parole: sāļots PBKDF2-SHA256, glabājas tikai hash un sāls.
- XSS: viss lietotāja teksts tiek ekranēts ar `E()` pirms ievietošanas HTML.
- Validācija: vārds 2–50, e-pasts pēc parauga, parole 8–100 rakstzīmes ar burtu un ciparu, nosaukums līdz 100, apraksts līdz 500, projekta nosaukums 2–60.
- Pieslēgšanās kļūda nenorāda, vai e-pasts eksistē.
- Sesija: nejaušs 192 bitu token `sessionStorage`; tiek dzēsts izrakstoties.

## Tiesības projektos
| Darbība | Īpašnieks | Dalībnieks |
| --- | --- | --- |
| Redzēt visus projekta uzdevumus | ✅ | ✅ |
| Izveidot uzdevumu un piešķirt dalībniekam | ✅ | ✅ |
| Labot / pabeigt / dzēst uzdevumu | visus | savus vai sev piešķirtos |
| Uzaicināt, noņemt dalībniekus, dzēst projektu, dzēst pabeigtos | ✅ | ❌ (var pamest projektu) |

## Testēšana
1. *Reģistrēties*: tukši lauki, nepareizs e-pasts, īsa parole, nesakrītošas paroles, atkārtots e-pasts → jābūt kļūdu ziņojumiem.
2. Pieslēgties ar nepareizu un pareizu paroli.
3. Izveidot uzdevumu, rediģēt, atzīmēt kā pabeigtu (parādās cilnē *Pabeigtie*), izmēģināt filtrus un kārtošanu.
4. *Projekti*: izveidot projektu, atvērt to, uzaicināt otru lietotāju pēc e-pasta (atkārtots uzaicinājums → ziņojums).
5. Otrā cilnē pieslēgties otrajā kontā → *Projekti* → *Pieņemt*; izveidot uzdevumu un piešķirt. Izmaiņas starp cilnēm sinhronizējas.
6. *User*: pārslēgt Light/Dark, mainīt vārdu un paroli, *Iziet*.
7. Pārbaudīt mobilo skatu (pārlūka DevTools, platums < 760 px).

## Ierobežojumi
- Dati glabājas tikai konkrētajā pārlūkā un datorā; pārlūka datu dzēšana izdzēš visu.
- Nav servera: visi lietotāji dalās vienā `localStorage`, tāpēc tiesības (un autorizācija) tiek kontrolētas tikai klienta kodā, un cilvēks ar piekļuvi pārlūka DevTools var datus nolasīt vai mainīt. Īstai drošībai starp ierīcēm jāpievieno serveris (piemēram, PHP + MySQL ar servera puses autorizāciju).
- Sesiju tokeni, kas palikuši pēc cilnes aizvēršanas bez izrakstīšanās, paliek datubāzē.

# Plānotājs (To-Do Planner)

Vienkārša uzdevumu un projektu pārvaldības lietotne ar kontiem, kopīgiem uzdevumiem un gaišo/tumšo režīmu. Veidota ar HTML, CSS un JavaScript bez servera vai ietvara.

## Palaišana

Atver `index.html` pārlūkā vai palaid lokālo serveri:

```sh
python -m http.server
```

Pēc tam atver http://localhost:8000. Lai paroles šifrēšana darbotos, izmanto `localhost`, `https` vai `file://`.

## Iespējas

- Reģistrācija, pieslēgšanās, profila un paroles maiņa.
- Personīgo uzdevumu veidošana, rediģēšana, dzēšana, meklēšana un filtrēšana.
- Projekti ar dalībnieku uzaicināšanu un kopīgiem, piešķiramiem uzdevumiem.
- Uzdevumu prioritātes, termiņi un progresa pārskats.
- Adaptīvs izkārtojums un gaišais/tumšais režīms.

## Dati un drošība

Dati tiek glabāti pārlūka `localStorage` un nav sinhronizēti starp ierīcēm. Lietotne izmanto PBKDF2 paroļu hashēšanai un ievaddatu validāciju, taču tai nav servera: piekļuves tiesības raksturīgas tikai klienta kodam, un pārlūka datiem var piekļūt vai tos mainīt lietotājs. Tā nav piemērota sensitīviem datiem.

## Failu struktūra

- `index.html` — lietotnes struktūra
- `css/` — stili un responsīvais izkārtojums
- `js/` — autentifikācija, dati, attēlošana un darbības

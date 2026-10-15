# Metodologia della ricerca educativa: mappa interattiva del corso

Sito statico che presenta i contenuti del corso triennale di Metodologia della ricerca educativa come una rete di note collegate, sul modello della vista a grafo di Obsidian.

- **464 note** su due livelli.
  - Livello dei concetti: 7 unità, 25 lezioni, 212 concetti, 19 autori, 17 risorse, 4 indici.
  - Livello di approfondimento: il manuale integrale (6 capitoli, 97 paragrafi), 25 mazzi di slide delle lezioni, 6 testi classici con i loro capitoli.
- Ogni concetto ha un riquadro **Per approfondire** che rimanda ai paragrafi del manuale e alle slide (con il numero di slide) in cui è trattato.
- Nel grafo, il selettore **Livello** mostra solo i concetti oppure anche gli approfondimenti.
- **Grafo globale** filtrabile per unità e tipo di nota; **grafo locale** e **collegamenti in entrata** per ogni nota.
- **Domande di autoverifica** dentro le note, con soluzione.
- **Ricerca** nel testo di tutte le note (tasto `/`).
- Funziona senza server e senza connessione: basta aprire `index.html`.

## Struttura della cartella

```
index.html          pagina del sito
assets/app.js       logica del grafo e delle note
assets/style.css    stile (tema chiaro e scuro)
assets/data.js      dati generati da build.py (non modificarlo a mano)
assets/vendor/      librerie d3 7.9.0 e marked 12.0.2, con licenze
notes/              le note in Markdown (fonte dei contenuti)
risorse/            file scaricabili (circa 74 MB)
  slide/            PDF delle slide, un file per lezione (1-1.pdf ... 7-2.pdf)
  libri/            classici di pubblico dominio (Dewey 1910 e 1916, Shaw)
  manuale/          figure del manuale
build.py            rigenera assets/data.js a partire da notes/
.nojekyll           dice a GitHub Pages di pubblicare i file così come sono
```

## Pubblicare su GitHub Pages (una volta sola)

1. Accedi a [github.com](https://github.com) e crea un nuovo repository (**New repository**). Nome suggerito: `metodologia-ricerca-educativa`. Visibilità: **Public**. Non aggiungere README.
2. Nella pagina del repository vuoto scegli **uploading an existing file**.
3. Trascina nella finestra **tutto il contenuto** di questa cartella (non la cartella stessa): `index.html`, `README.md`, `build.py`, `.nojekyll` e le cartelle `assets`, `notes`, `risorse`. Conferma con **Commit changes**.
   - Se il browser non accetta il trascinamento di cartelle, carica i file in più passaggi oppure usa GitHub Desktop.
4. Vai su **Settings → Pages**. In *Build and deployment* scegli **Source: Deploy from a branch**, poi **Branch: main** e cartella **/ (root)**. Salva.
5. Dopo uno o due minuti il sito è online all'indirizzo `https://NOME-UTENTE.github.io/metodologia-ricerca-educativa/`.

## Modificare o aggiungere contenuti

Le note sono file Markdown nella cartella `notes/`. Il nome del file è il titolo della nota.

```markdown
---
tipo: concetto        # indice, unita, lezione, concetto, autore, risorsa,
                      # libro, capitolo, sezione, slide
unita: [2, 3]         # unità a cui appartiene (0 per le note generali)
---

Testo della nota con collegamenti come [[Validità]]
o con testo alternativo: [[Validità di criterio|validità concorrente]].
```

Domande di autoverifica (`+` = risposta corretta, anche più di una):

````markdown
```quiz
D: Testo della domanda
- risposta sbagliata
+ risposta corretta
S: Spiegazione mostrata dopo la verifica.
```
````

Dopo ogni modifica:

```bash
python build.py
```

Lo script aggiorna `assets/data.js` e segnala i collegamenti `[[...]]` che non corrispondono a nessuna nota. Poi carica su GitHub i file modificati (la nota e `assets/data.js`).

**Con Obsidian.** La cartella `notes/` si può aprire direttamente come vault di Obsidian (*Open folder as vault*): collegamenti e grafo funzionano anche lì. Dopo aver modificato le note in Obsidian, esegui comunque `build.py` per aggiornare il sito.

## Note sui contenuti

- Le note sintetizzano le slide del corso (unità 1-3 e 5-7, versione "Metodologia salesiani") integrate con il materiale del manuale (disegni sperimentali, campionamento non probabilistico, raccolta dei dati, comunicazione dei risultati), con cui è stata costruita l'unità 4.
- Dove le slide contenevano imprecisioni, le note riportano la versione corretta e lo segnalano (ad esempio: disegno di *Solomon*, inversione strumenti aperti e chiusi nel riepilogo 3.3, abiura di Galileo, dimensione del campione).
- Video, canzoni e testi di terzi **non sono ospitati** nel sito: le schede "Risorse" ne spiegano il ruolo didattico e rimandano a fonti pubbliche.
- Non sono stati pubblicati: elenchi degli studenti, composizione dei gruppi, fascicoli di prove, file di servizio.

## Livello di approfondimento: avvertenze

- **Slide**: i PDF sono stati convertiti automaticamente dai file PowerPoint e alcuni caratteri sono sostituiti, con testi che a volte escono dai riquadri. Per una resa fedele esporta le slide in PDF da PowerPoint (*File, Esporta, PDF*) e sostituisci i file in `risorse/slide/` mantenendo gli stessi nomi: i collegamenti continuano a funzionare.
- **Manuale**: il testo è pubblicato integralmente per concessione dell'autore. La conversione dei capitoli 4-6 ha richiesto la ricomposizione delle righe e può contenere piccoli difetti; mancano nel file sorgente i paragrafi 3.5.7 e 4.3.
- **Lettera a una professoressa** (Scuola di Barbiana, 1967): opera protetta. Il sito ne offre solo una mappa ragionata; il PDF non va mai caricato nel repository.
- **Novum Organum** (Bacone, 1620): la scheda è presente, ma il file disponibile è una traduzione portoghese e va sostituito con un'edizione di pubblico dominio (latino o inglese).
- I PDF di Dewey e Shaw sono scansioni: la ricerca nel testo dipende dalla qualità dell'OCR.
- La corrispondenza tra slide e concetti è stata costruita in modo semiautomatico (parole chiave e lezione di appartenenza): conviene una verifica da parte del docente.

## Crediti e licenza

Da completare a cura del docente: autore dei materiali originali, anno accademico, licenza dei contenuti (ad esempio CC BY-NC-SA 4.0). Le librerie incluse in `assets/vendor/` mantengono le rispettive licenze (d3: ISC; marked: MIT).

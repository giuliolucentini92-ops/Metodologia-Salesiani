---
tipo: sezione
unita: [5]
---

<div class="srcbox">Testo integrale dal manuale · [[Manuale · Capitolo 5. La codifica e la preparazione dei dati]]</div>

**Concetti trattati**: [[Codebook]], [[Valori mancanti]], [[Scale di misura]]

---

Non appena definiti nella loro struttura gli strumenti di rilevazione è necessario costruire il codebook dei dati, ossia un libro codice che contiene gli elementi che servono per definire le modalità di codifica delle informazioni e trasformarle in una matrice dati..

Le informazioni contenute nel codebook riguardano il nome attribuito alle diverse variabili, il tipo di formato con cui la variabile verrà registrata (numerico, stringa, data ecc.), le etichette descrittive delle variabili e dei valori che queste contengono (poiché in genere è preferibile registrare le informazioni in formato numerico le etichette dei valori registrano il rapporto tra numero e informazione contenuta), i codici speciali per i valori mancanti 1 .

Per essere più chiari, facciamo un esempio, prendendo come riferimento alcune domande tratte da un questionario sottoposto a utenti dei servizi sociali.

L’etichetta delle variabili (che può essere costituita da molti caratteri) presenta una spiegazione completa e viene utilizzata nei risultati delle elaborazioni (tabelle e grafici) in modo da rendere comprensibile i risultati. Quando si costruiscono delle etichette bisogna però fare sempre attenzione a non superare il numero di caratteri stabilito dal programma formulando etichette che abbiano senso compiuto.

Schema 1. Esempio di domande di un questionario

1\. Sesso  M  F

2\. Età (indicare l’età in anni compiuti) 

3\. Titolo di studio  Nessuno  Licenza elementare  Licenza media  Diploma di scuola secondaria superiore  Laurea

4\. Nazionalità  Italiana  Altri stati d’Europa  Stati extraeuropei

5\. È la prima volta che contatta un Assistente Sociale?

 Sì  No In primo luogo, il ricercatore dovrà stabilire in che modo codificare le diverse variabili, indipendentemente dal tipo di programma statistico che poi utilizzerà per analizzare i dati. Nello specifico stabilirà che:

a\) la variabile 2 2 , la cui etichetta e il cui nome della variabile è “SESSO”, è di tipo numerico e che il valore 1 corrisponde alla risposta “Maschio” e il valore “2” alla risposta “Femmina”, il valore 9 indica le risposte omesse 3 ;

b\) la variabile 3, la cui etichetta è “età in anni compiuti” e il cui nome sintetico è “ETA”, è di tipo numerico e la risposta è aperta. La lunghezza del campo è di due spazi ( da 0 a 99) il valore 99 indicherà le risposte omesse;

c\) la variabile 4, per cui è utile prevedere un nome sintetico, per esempio “TITSTUD”, e la cui etichetta è “titolo di studio”, è di tipo numerico, e il valore 1 indica la risposta “nessun titolo”, il valore 2 “licenza elementare”, il valore 3

9\. L’attribuzione di questi codici deve però dipendere dal tipo di risposta che è possibile dare alle diverse domande dello strumento che si è utilizzato. Nel caso di un questionario in cui si ha la seguente domanda aperta “Da quanti anni sei iscritto all’università?” è possibile dare la risposta 9. In tali casi tale codice si potrebbe confondere con le risposte omesse. Quando si possono verificare sovrapposizioni di codici è allora necessario attribuire un altro codice come risposta omessa, ad esempio 99.

“licenza media”, il valore 4 “Diploma di scuola secondaria superiore”, il valore 5 “laurea”, il valore 9 le risposte omesse e il valore 8 le doppie risposte;

d\) la variabile 5, per cui è anche utile prevedere un nome sintetico, per esempio “NAZIO”, e la cui etichetta è “nazionalità” è di tipo numerico, e il valore 1 indica “italiana”, 2 “altri stati d’Europa” e 3 “Stati extra europei”;

e\) la variabile 6, il cui nome potrebbe essere “contass” e la cui etichetta è “Prima volta che si contatta un assistente sociale”, è di tipo numerico e che il valore 1 corrisponde alla risposta “sì” e il valore “2” alla risposta “no”.

Nello schema 2 riportiamo sinteticamente un esempio di codebook indicando, inoltre, la natura delle scale per le diverse variabili prese in esame 4 .

Schema 2. Esempio di codebook Domanda del questionario Etichetta variabile Nome della variabile Codifica Etichetta modalità di risposte Lunghezza campo/ Cifre decimali Natura della variabile/ scala

1\. Sesso  M  F Sesso Sesso 1 1 = maschio 1 nominale 2 2= femmina 9 9= omessa

2\. Età in anni compiuti Età in anni compiuti Età da 18 a 99 Inserire età in anni 99= Omissione 2 di rapporti

3\. Titolo di studio  Nessun titolo  Licenza elementare  Licenza media  Diploma di scuola secondaria superiore  Laurea Titolo di studio Titstu 1 1= Nessun titolo 1 ordinale 2 2= Lic. Elementare 3 3= Lic. Media 4 4= Scuola sec.

5 5= Laurea 8 8= Doppia risposta 9 9 = Omissione

4\. Nazionalità  Italiana  Altri stati d’Europa  Stati extraeuropei Nazionalità Nazio 1 1= Italiana 1 nominale 2 2= Altri stati d’Europa 3 3= Stati extraeuropei 8 8= Doppia risposta 9 9 = Omissione

5\. È la prima volta che contatta un Assistente Sociale?

 Sì  No Prima volta che si contatta un assistente sociale Contass 1 1= Sì 1 nominale 2 2 = No 9 9 = Omissione Nella costruzione del codebook bisogna perciò prestare particolare attenzione al numero di risposte che è possibile dare alle diverse domande dello strumento di cui si devono analizzare i dati. Le domande del questionario a cui si è fatto riferimento nel nostro esempio sono tutte a una sola risposta, in alcuni casi domande con più alternative di risposta ma a cui è richiesto di dare una sola risposta. Nel caso, però, in cui vi sia

4 Come si è detto nel capitolo 1 (§ 11.5), si possono distinguere 4 differenti tipi di scale in ambito educativo, dalla più semplice alla più complessa, ognuna delle quali gode delle proprietà di quella precedente: nominale, ordinale, a intervalli, di rapporti. una domanda che prevede più risposte, il numero di variabili da considerare aumenta. Ovvero vanno inserite tante variabili quanto è il numero di risposte che si possono dare. Per esempio, nella domanda riportata nello schema 3 bisogna prevedere nella matrice dati due colonne, una per ogni risposta: la domanda genera infatti due variabili (la variabile prima risposta e la variabile seconda risposta, ciascuna di un campo).

Schema 3. Esempio di domanda con due risposte Per valutare gli studenti in educazione civica, faccio ricorso soprattutto a … (segnare due risposte) compiti scritti  test di profitto  verifiche orali  partecipazione alla discussione  altri strumenti di valutazione  nessuno strumento di valutazione specifico  Ancora, nel caso delle domande aperte (nel nostro esempio la domanda relativa all’età) in cui non viene offerto all’intervistato un ventaglio di risposte possibili, la codifica delle risposte viene effettuata a posteriori, dopo aver esaminato tutte le risposte date dai rispondenti e individuato una serie di categorie il più possibile complete e esaustive in cui classificarle e quindi poter codificare le risposte. Il numero di cifre per variabile varia quindi in relazione al numero di categorie che saranno individuate. La lunghezza del campo dipende invece dal tipo di risposta richiesta, rispetto all’età sono sufficienti due cifre mentre se si tratta di stabilire lo spazio massimo utilizzabile per inserire le risposte.

Quando si inseriscono i dati bisogna inoltre prendere tutta una serie di decisioni che riguardano il modo in cui registrare le risposte: se indicare le risposte in formato alfabetico o numerico (nel caso dei numeri stabilire il numero di cifre decimali da visualizzare) 5 ; come segnalare le risposte omesse; come segnalare le doppie risposte ecc.

È necessario ricordare continuamente che la trasformazione delle informazioni in codici o in numeri non cambia la natura dei dati disponibili.

Il fatto ad esempio che decida di codificare in numeri le risposte a due domande che si riferiscono ad abilità diverse non consente di sommare queste risposte. Ogni informazione rimane legata alla scala di misura utilizzata per rilevarla e alle sue proprietà. La facilità di calcolo offerta dai programmi informatici si presta infatti molto spesso a un uso improprio dei dati.

#### Note

<p class="fn"><sup>1</sup> È utile attribuire alle variabili un nome breve per semplificare l’uso nelle elaborazioni successive. Nei più diffusi programmi statistici generalmente il nome della variabile (etichetta breve) non deve superare gli 8 caratteri.</p>

<p class="fn"><sup>2</sup> Iniziamo dalla variabile 2 perché come si vedrà nello schema 3 che riguarda la matrice dati, la prima colonna, la cui etichetta è “casi”, rappresenta la variabile 1, in cui viene riportato il codice di identificazione dei soggetti intervistati, che nel nostro esempio va da 1 a 30 e la cui lunghezza del campo è pertanto di due spazi.</p>

<p class="fn"><sup>3</sup> Generalmente per indicare le risposte omesse o mancanti si usa il codice numerico 0 o</p>

<p class="fn"><sup>5</sup> Generalmente si utilizzano i codici numerici piuttosto che alfabetici ma i più diffusi programmi di calcolo sono in grado di leggere entrambi i tipi di codici o di trasformarli una volta inseriti.</p>

---

← [[Manuale § 4.4 Il controllo della qualità]] · [[Manuale § 5.2 La costruzione di una matrice di dati]] →

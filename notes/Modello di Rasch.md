---
tipo: concetto
unita: [7]
---

Sviluppato da [[Georg Rasch]], è il modello IRT a un parametro: la probabilità che una persona con abilità θ risponda correttamente a un item di difficoltà b è

**P = e^(θ − b) / (1 + e^(θ − b))**

- se θ = b, P = 50%;
- se θ > b, P > 50%; se θ < b, P < 50%.

Abilità e difficoltà si esprimono in **logit**. Un primo modo intuitivo di avvicinarsi alla difficoltà è il rapporto tra risposte errate e corrette (un item sbagliato da 4 e superato da 2 ha rapporto 2,0); il logaritmo di questo rapporto è la difficoltà in logit.

**Esempio della lezione**: Belinda ha abilità −2,20; l'item 9 ha difficoltà −2,08. θ − b = −0,12, quindi P ≈ 47%. Per un item di difficoltà 1,25 la sua probabilità scende al 3%.

Proprietà importante: nel modello di Rasch il punteggio totale contiene tutta l'informazione sull'abilità, ma il modello permette di **verificare** se i dati si adattano a questa ipotesi (item che non si adattano vanno rivisti).

Collegamenti: [[Item Response Theory]], [[Curva caratteristica dell'item]].

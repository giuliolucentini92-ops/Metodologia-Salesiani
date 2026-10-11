---
tipo: concetto
unita: [2, 3]
---

L'errore standard di misura (SEM, *Standard Error of Measurement*) indica quanto il punteggio osservato di una persona può differire dal suo **punteggio vero** a causa di errori casuali.

**Formula**: SEM = SD × √(1 − rₓₓ)

- SD = [[Deviazione standard]] dei punteggi osservati;
- rₓₓ = coefficiente di [[Affidabilità]] del test (ad esempio l'[[Alfa di Cronbach]]).

Se rₓₓ = 1 il SEM è 0 (nessun errore); se rₓₓ = 0 il SEM coincide con la SD (tutta la variabilità è errore).

Il SEM permette di costruire un **intervallo di confidenza** attorno al punteggio osservato: punteggio vero ≈ punteggio osservato ± z × SEM (z = 1,96 per il 95%).

**Esempio.** SD = 10, α = 0,84. SEM = 10 × √0,16 = 10 × 0,4 = 4. Per uno studente con 80 punti il punteggio vero è compreso, con il 95% di probabilità, tra 80 − 7,84 = 72,2 e 80 + 7,84 = 87,8.

**Conseguenza pratica.** Due studenti con 78 e 82 punti non sono distinguibili con questo test. Confrontare singoli punteggi senza considerare il SEM è uno degli errori più comuni nell'uso dei test (vedi [[Decalogo per misurare con misura]]).

```quiz
D: Un test ha SD = 8 e affidabilità 0,75. Qual è il SEM?
- 2
+ 4
- 6
- 8
S: SEM = 8 × √(1 − 0,75) = 8 × √0,25 = 8 × 0,5 = 4.
```

Collegamenti: [[Errore di misura]], [[Teoria classica dei test]].
